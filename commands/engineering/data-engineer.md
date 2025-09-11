# Data Engineer Command

Invoke the **Data Engineer Agent** for data pipeline design, ETL processes, data warehousing, and data infrastructure tasks.

## Agent Path
`agents/engineering/data-engineer.md`

## When to Use
- Designing and implementing ETL/ELT pipelines
- Building data warehouses and data lakes
- Setting up stream processing systems
- Implementing data quality monitoring
- Creating analytics data models
- Data governance and lineage tracking

## Key Specializations
- **Pipeline Tools:** Apache Airflow, dbt, Prefect
- **Data Warehouses:** Snowflake, BigQuery, Redshift
- **Stream Processing:** Kafka, Spark, Flink
- **Cloud Platforms:** AWS/GCP/Azure data services

## Usage
```bash
# Example usage in project context
claude exec commands/engineering/data-engineer.md "Design ETL pipeline for customer analytics data from PostgreSQL to BigQuery with dbt transformations"
```