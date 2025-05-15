
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const adminEmail = "ma-eaosafo2522@st.umat.edu.gh";

const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvoiceRequest {
  orderId: string;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { orderId, userId } = await req.json() as InvoiceRequest;

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found: " + orderError?.message);
    }

    // Get order items with product details
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        *, 
        products:product_id(
          name, 
          price, 
          discount
        )
      `)
      .eq("order_id", orderId);

    if (itemsError) {
      throw new Error("Failed to get order items: " + itemsError.message);
    }

    // Get user details
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      throw new Error("User not found: " + userError?.message);
    }

    // Get user's email from auth table
    const { data: userAuth, error: authError } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .single();

    if (authError) {
      throw new Error("Failed to get user email: " + authError.message);
    }

    const userEmail = userAuth?.email || "customer@example.com";

    // Format order items for email
    const items = orderItems.map(item => {
      const product = item.products;
      const price = product?.discount
        ? product.price * (1 - product.discount / 100)
        : product?.price || 0;
      
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${product?.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">Size ${item.size}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">₵${price.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">₵${(price * item.quantity).toFixed(2)}</td>
        </tr>
      `;
    }).join("");

    const shippingCost = order.total > 100 ? 0 : 9.99;
    const subtotal = order.total - shippingCost;
    const orderReference = `ORDER-${orderId.slice(0, 8)}`;
    
    // Generate HTML email
    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background-color: #f97316; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; }
          th { text-align: left; padding: 10px; background-color: #f3f4f6; }
          .total-row { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>JE's Palace Shoes</h2>
            <p>Order Confirmation #${orderReference}</p>
          </div>
          <div class="content">
            <p>Dear ${userData.first_name || "Valued Customer"},</p>
            <p>Thank you for your order. Here are your order details:</p>
            
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${items}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" style="padding: 10px; text-align: right;">Subtotal:</td>
                  <td style="padding: 10px;">₵${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="4" style="padding: 10px; text-align: right;">Shipping:</td>
                  <td style="padding: 10px;">${shippingCost === 0 ? "Free" : `₵${shippingCost.toFixed(2)}`}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="4" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                  <td style="padding: 10px; font-weight: bold;">₵${order.total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            
            <p>Your order will be processed shortly. We'll send you another email once your order ships.</p>
            <p>Thank you for shopping with JE's Palace Shoes!</p>
          </div>
          <div class="footer">
            <p>JE's Palace Shoes | Premium Footwear with Advanced Comfort</p>
            <p>© ${new Date().getFullYear()} JE's Palace Shoes. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
    `;

    // Send email to customer
    const customerEmailResult = await resend.emails.send({
      from: "JE's Palace Shoes <orders@jespalace.com>",
      to: [userEmail],
      subject: `Order Confirmation #${orderReference}`,
      html: htmlContent,
    });

    console.log("Customer email sent:", customerEmailResult);

    // Send email to admin
    const adminEmailResult = await resend.emails.send({
      from: "JE's Palace Orders <orders@jespalace.com>",
      to: [adminEmail],
      subject: `New Order #${orderReference}`,
      html: htmlContent,
    });

    console.log("Admin email sent:", adminEmailResult);

    // Format message for WhatsApp
    const whatsappMessage = `
*New Order #${orderReference}*
Customer: ${userData.first_name} ${userData.last_name}
Email: ${userEmail}
Total: ₵${order.total.toFixed(2)}
Items: ${orderItems.length}

*Order Details:*
${orderItems.map(item => {
  const product = item.products;
  return `${product?.name} (Size ${item.size}) x ${item.quantity}`;
}).join('\n')}

Visit admin dashboard to process this order.
    `;

    return new Response(
      JSON.stringify({ 
        success: true, 
        customerEmail: customerEmailResult, 
        adminEmail: adminEmailResult,
        whatsappMessage: encodeURIComponent(whatsappMessage)
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error processing invoice:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
