import matplotlib.pyplot as plt
import seaborn as sns
import config
from etl.utils import setup_logger

logger = setup_logger("Charts")

def generate_charts(dataframes: dict):
    logger.info("Generating analytical charts...")
    
    # 1. User Roles Chart
    if "users" in dataframes and not dataframes["users"].empty:
        df = dataframes["users"]
        if 'role' in df.columns:
            plt.figure(figsize=(8, 5))
            sns.countplot(data=df, x='role', order=df['role'].value_counts().index)
            plt.title('Distribution of User Roles')
            plt.xlabel('Role')
            plt.ylabel('Count')
            plt.tight_layout()
            plt.savefig(config.CHART_DIR / "user_roles_distribution.png")
            plt.close()
            
    # 2. Complaints Status Chart
    if "complaints" in dataframes and not dataframes["complaints"].empty:
        df = dataframes["complaints"]
        if 'status' in df.columns:
            plt.figure(figsize=(6, 6))
            status_counts = df['status'].value_counts()
            plt.pie(status_counts, labels=status_counts.index, autopct='%1.1f%%', startangle=90)
            plt.title('Complaints by Status')
            plt.axis('equal')
            plt.savefig(config.CHART_DIR / "complaints_status_pie.png")
            plt.close()
            
    # 3. Expenses by Status/Month (simplified if month feature exists)
    if "expenses" in dataframes and not dataframes["expenses"].empty:
        df = dataframes["expenses"]
        if 'status' in df.columns:
            plt.figure(figsize=(8, 5))
            sns.countplot(data=df, x='status')
            plt.title('Expenses/Billing Status')
            plt.xlabel('Status')
            plt.ylabel('Count')
            plt.tight_layout()
            plt.savefig(config.CHART_DIR / "expenses_status.png")
            plt.close()

    logger.info("Charts generated successfully.")
