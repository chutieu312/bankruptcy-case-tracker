/**
 * AWS Lambda SQS consumer — Case Status Change Notifications
 * JD skill demonstrated: AWS Lambda + SQS + Node.js
 *
 * Triggered by: SQS queue "case-notifications"
 * Locally simulated via: LocalStack
 */

exports.handler = async (event) => {
  const results = [];

  for (const record of event.Records) {
    try {
      const payload = JSON.parse(record.body);
      console.log(`[${new Date().toISOString()}] Processing notification:`, JSON.stringify(payload));

      if (payload.eventType === "CASE_STATUS_CHANGED") {
        await handleCaseStatusChanged(payload);
      } else {
        console.warn("Unknown eventType:", payload.eventType);
      }

      results.push({ messageId: record.messageId, status: "ok" });
    } catch (err) {
      console.error("Failed to process record:", record.messageId, err);
      // Do NOT throw — allows partial batch success
      results.push({ messageId: record.messageId, status: "error", error: err.message });
    }
  }

  console.log("Batch result:", JSON.stringify(results));
  return { batchItemFailures: [] };
};

async function handleCaseStatusChanged(payload) {
  const { caseId, caseNumber, oldStatus, newStatus, timestamp } = payload;

  // In production: send email via SES, push via SNS, or write to audit log
  console.log(
    `NOTIFY: Case #${caseNumber} (id=${caseId}) changed from ${oldStatus} to ${newStatus} at ${timestamp}`
  );

  // Simulate async work (e.g., calling SES)
  await new Promise((resolve) => setTimeout(resolve, 10));
}
