const cron = require("node-cron");
const supabase = require("./supabase");
const sendLowStockEmail = require("./mailer");

cron.schedule("*/5 * * * *", async () => {
 
  console.log("🔍 Checking inventory...");

  const { data, error } = await supabase
    .from("inventory")
    .select("*");

  if (error) {
    console.error(error);
    return;
  }

  const lowStock = data.filter(
  (item) =>
    item.stock <= item.threshold &&
    item.low_stock_email_sent === false
);

if (lowStock.length > 0) {
  await sendLowStockEmail(lowStock);

  for (const item of lowStock) {
    await supabase
      .from("inventory")
      .update({ low_stock_email_sent: true })
      .eq("id", item.id);
  }

  console.log("✅ Low stock email sent");
} else {
  console.log("✅ No new low stock alerts");
}

});

console.log("⏰ Low Stock Cron Started");