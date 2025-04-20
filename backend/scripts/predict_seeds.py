import psycopg2
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MinMaxScaler
from sqlalchemy import create_engine

# === Database Connection ===
conn = psycopg2.connect(
    dbname='nba_predictor',
    user='postgres',
    password='021306',
    host='localhost',
    port='5432'
)

# === Load team_season_stats ===
query = """
    SELECT * FROM team_season_stats
    WHERE "Year" BETWEEN 2000 AND 2025 AND "StatType" = 'per_game'
"""
df = pd.read_sql(query, conn)

# === Preprocess ===
df['win_loss_percentage'] = df['W'] / (df['W'] + df['L'])
df['games_remaining'] = 82 - df['G']

# --- Split data ---
train_df = df[df['Year'] <= 2024].copy()
predict_df = df[df['Year'] == 2025].copy()

# === Train ML Model on only performance stats (no W/L anchoring) ===
features = ['G', 'ORtg', 'DRtg', 'NRtg']
target = 'win_loss_percentage'

X_train = train_df[features]
y_train = train_df[target]
X_predict = predict_df[features]

scaler = MinMaxScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_predict_scaled = scaler.transform(X_predict)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)

# === Predict ===
predicted_pct = model.predict(X_predict_scaled)
predict_df['Projected_W'] = predict_df['W'] + (predict_df['games_remaining'] * predicted_pct)
predict_df['Projected_L'] = 82 - predict_df['Projected_W']
predict_df['Projected_W/L%'] = predict_df['Projected_W'] / 82

# === Update values ===
predict_df['W'] = predict_df['Projected_W'].round()
predict_df['L'] = predict_df['Projected_L'].round()
predict_df['W/L%'] = predict_df['Projected_W/L%']
predict_df['G'] = 82

# === Rank within each conference ===
predict_df.sort_values(by=['Conf', 'W'], ascending=[True, False], inplace=True)
predict_df['Rk'] = predict_df.groupby('Conf').cumcount() + 1

# === Clean up helper columns ===
predict_df.drop(columns=['Projected_W', 'Projected_L', 'Projected_W/L%', 'games_remaining', 'win_loss_percentage'], inplace=True)

# === Recreate projected_team_stats table ===
with conn.cursor() as cur:
    cur.execute("DROP TABLE IF EXISTS projected_team_stats")
    cur.execute("""
        CREATE TABLE projected_team_stats AS
        TABLE team_season_stats WITH NO DATA
    """)
    conn.commit()

# === Insert projected data ===
engine = create_engine("postgresql+psycopg2://postgres:021306@localhost:5432/nba_predictor")
predict_df.to_sql('projected_team_stats', engine, if_exists='append', index=False, method='multi')

conn.close()
print("✅ projected_team_stats created — with real seeding changes based on performance.")
