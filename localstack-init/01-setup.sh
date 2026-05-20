#!/bin/bash
# LocalStack init script — creates S3 bucket and SQS queue on startup
set -e

echo "Creating S3 bucket: case-documents"
awslocal s3 mb s3://case-documents

echo "Creating SQS queue: case-notifications"
awslocal sqs create-queue --queue-name case-notifications

echo "LocalStack resources ready"
