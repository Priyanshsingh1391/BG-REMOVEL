//Api controller function to manage user with database
//http://localhost:4000/api/user/webhooks
import {Webhook} from 'svix'
import userModel from '../models/userModal.js';
import razorpay from 'razorpay';
import transactionModel from '../models/transactionModel.js';


const clerkWebhooks = async(req,res)=>{

try {
    
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

    await whook.verify(JSON.stringify(req.body),{
        "svix-id": req.headers['svix-id'],
        "svix-timestamp": req.headers['svix-timestamp'],
        "svix-signature": req.headers['svix-signature']
    })

    const {data,type} = req.body
    console.log('id',data);
    

    switch(type){
        case "user.created":{
            const userData = {
                clerkId: data.id,
                email: data.email_addresses[0].email_address,
                firstName: data.first_name, 
                lastName: data.last_name,
                photo: data.profile_image_url
            }

            await userModel.create(userData)
            res.json({success:true,message: "User created successfully"})
            break;
        }
        case "user.updated":{

            const userData = {
                
                email: data.email_addresses[0].email_address,
                firstName: data.first_name, 
                lastName: data.last_name,
                photo: data.profile_image_url
            }

            await userModel.findOneAndUpdate({clerkId: data.id},userData)
            res.json({success:true,message: "User updated successfully"})

            break;
        }
        case "user.deleted":{
            await userModel.findOneAndDelete({clerkId: data.id})
            res.json({success:true,message: "User deleted successfully"})


            break;
        }

    }

} catch (error) {
    

    console.error('Error verifying webhook:', error)
    return res.json({success:false,message: error.message})
}

}








// api controllers function to get user avaialble credit data

const userCreditData = async(req,res)=>{
    try {
        const clerkId = req.clerkId;
 
        const userData = await userModel.findOne({clerkId})  
         res.json({success:true, credits:userData.creditBalance})

    } catch (error) {

         console.error('Error verifying webhook:', error)
    return res.json({success:false,message: error.message})
    }
}

// gateway initialise
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// API to make payment for credits

const paymentRazorpay = async (req, res) => {
  try {
    const clerkId = req.clerkId; // ✅ from auth middleware
    const { planId } = req.body;

    const userData = await userModel.findOne({ clerkId });

    if (!userData || !planId) {
      return res.json({ success: false, message: "Invalid request" });
    }

    let credits, plan, amount;

    switch (planId) {
      case "Basic":
        plan = "Basic";
        credits = 100;
        amount = 10;
        break;

      case "Advanced":
        plan = "Advanced";
        credits = 500;
        amount = 50;
        break;

      case "Buisness":
        plan = "Buisness";
        credits = 5000;
        amount = 250;
        break;

      default:
        return res.json({ success: false, message: "Invalid plan" });
    }

    // Create transaction (payment = false initially)
    const transaction = await transactionModel.create({
      clerkId,
      plan,
      amount,
      credits,
      payment: false,
      date: Date.now(),
    });

    const options = {
      amount: amount * 100, // paise
      currency: process.env.CURRENCY || "INR",
      receipt: transaction._id.toString(),
    };

    // ✅ Promise-based Razorpay order creation
    const order = await razorpayInstance.orders.create(options);

    return res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay error:", error);
    return res.json({ success: false, message: error.message });
  }
};

//API Controller function to verify razorpay payment
const verifyRazorPay = async(req, res)=>{
  try {
    const {razorpay_order_id} = req.body

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

    if(orderInfo.status === 'paid'){
      const transactionData = await transactionModel.findById(orderInfo.receipt)

      if(transactionData.payment){
        return res.json({success: false,message: 'Payment Failed'})
      }

      //Adding Credits in user data
      const userData = await userModel.findOne({clerkId:transactionData.clerkId})
      const creditBalance = userData.creditBalance + transactionData.credits
      await userModel.findByIdAndUpdate(userData._id,{creditBalance})

      //making the payment true
      await transactionModel.findByIdAndUpdate(transactionData._id,{payment:true})

      res.json({success:true,message:"credits Added"})
    }

  } catch (error) {
     console.error("Razorpay error:", error);
    return res.json({ success: false, message: error.message });
  }
}


export {clerkWebhooks, userCreditData, paymentRazorpay, verifyRazorPay}