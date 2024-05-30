const express = require('express');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const cors = require('cors');
const fs = require('fs');
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb+srv://tawfeeqpathan3:6AzWJp1v0BZHgK3u@cluster0.xintycg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

// Firebase Admin Setup
const serviceAccount = JSON.parse(fs.readFileSync('./service-account-file.json', 'utf8'));
 admin.initializeApp({   credential: admin.credential.cert(serviceAccount)
});

// Models
const Employee = mongoose.model('Employee', new mongoose.Schema({ name: String, email: String,password:String,role:{type:String,default:'EMPLOYEE'} }));
const Ticket = mongoose.model('Ticket', new mongoose.Schema({ title: String, description: String, status: String }));
const Notification = mongoose.model('Notification', new mongoose.Schema({ content: String,},{timestamps:true}));
const UserToken = mongoose.model('UserToken', new mongoose.Schema({token:String},{timestamps:true}));
// Routes
app.get('/employees', async (req, res) => {
  const employees = await Employee.find();
  res.send(employees);
});
app.get('/notifications', async (req, res) => {
  const notifications = await Notification.find();
  res.send(notifications);
});
app.post('/employees', async (req, res) => {
  const employees = await Employee.create(req.body);
  res.send(employees);
});
app.post('/tokens', async (req, res) => {
  
   await UserToken.create(req.body);
  res.send({success:true});
});

app.post('/notify', async (req, res) => {
  const {adminmessage} = req.body;
  const tokens = await UserToken.find();
  const tokenArray = [];

// Loop through each object in the dataArray
tokens.forEach(item => {
  // Push the token value into the tokenArray
  tokenArray.push(item.token);
});
try {
   await admin.messaging().sendMulticast({
    data: { message: adminmessage },
    tokens: tokenArray
  });  

  await Notification.create({content:adminmessage})
  res.send({ success: true });
  
} catch (error) {
  console.log(error);
}
});

app.post('/tickets', async (req, res) => {
  
  const ticket = new Ticket(req.body);
  await ticket.save();
  res.send(ticket);
});
app.post('/login', async (req, res) => {
 const {email,password}= req.body;
 const user = await Employee.findOne({email:email});
 if(!user){
  res.send({message:"No user found"})
 }else{
  if(user.password == password){
    res.send(user)
   }else{
    res.send({message:"Invalid email or password"})
   }
 }

});


app.get('/tickets', async (req, res) => {
  const tickets = await Ticket.find();
  res.send(tickets);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
