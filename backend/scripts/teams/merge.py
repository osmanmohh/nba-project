import pandas as pd

# Load the two CSVs
ratings_df = pd.read_csv("backend/data/team_ratings.csv")
team_df = pd.read_csv("backend/data/team_data2.csv")

# Select only the desired columns from ratings
ratings_subset = ratings_df[['Year', 'Tm', 'Conf', 'Div', 'W', 'L', 'W/L%', 'ORtg', 'DRtg', 'NRtg']]

# Merge on Year and Tm
merged_df = pd.merge(team_df, ratings_subset, on=["Year", "Tm"], how="left")

# Save to CSV
merged_df.to_csv("backend/data/merged_team_data.csv", index=False)
print("✅ Merged data saved to 'merged_team_data.csv'")
