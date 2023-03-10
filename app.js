// const express = require("express");
// const bodyParser = require("body-parser");
//
// const app = express();
// var items = [];
// app.use(bodyParser.urlencoded({extended:true}));
// app.set("view engine","ejs");
//
//
// app.get("/" , function(req , res){
//   var today = new Date();
//
//   var options = {
//     weekday: "long",
//     day: "numeric",
//     month: "long"
//   };
//
//  var day = today.toLocaleDateString("en-US" , options);
//
//
//  res.render("list" , {kindOfDay:day , newListItem:items});
//
// });
//
// app.post("/" , function(req , res){
//   var item = req.body.newItem;
//   items.push(item);
//   res.redirect("/");
// })
//
// app.listen(3000 , function(){
//   console.log("server started at port 3000");
// });

// const express = require("express");
// const bodyParser = require("body-parser");
//
// const app = express();
//
// app.set("view engine","ejs");
//
// app.get("/" , function(req , res){
//    var today = new Date();
//    var currentDay = today.getDate();
//    var day = "";
//
//   if(currentDay === 1 )
//   {
//     day = "Sunday";
//   }
//   else if(currentDay === 2 )
//   {
//     day = "Tuesday";
//   }
//   else if(currentDay === 3 )
//   {
//     day = "Wednesday";
//   }
//   else if(currentDay === 4 )
//   {
//     day = "Thursday";
//   }
//
//   else if(currentDay === 5 )
//   {
//     day = "Friday";
//   }
//
//   else
//   {
//     day = "Saturday";
//   }
//
//   res.render("list" , {kindOfDay:day});
//
//
// });
//
//
// app.listen(3000 ,function(){
//   console.log("server started at port 3000");
// })


const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.set('strictQuery',true);
mongoose.connect("mongodb+srv://admin-aryan:Test123@cluster0.f1hwuvq.mongodb.net/todolistDB");




const app = express();
var items = ["Buy Food","Cook Food","Eat Food"];
let workItems = [];
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item" , itemsSchema);

const item1 = new Item({
  name:"Welcome to your todolist!"
});

const item2 = new Item({
  name:"Hit the + button to off a new item"
});

const item3 = new Item({
  name:"<-- Hit this to delete an item."
});

const defaultItems = [item1 , item2 , item3];

const listSchema = {
  name:String,
  items:[itemsSchema]
};


const List = mongoose.model("List" , listSchema);


app.get("/" , function(req , res){

  Item.find({} , function(err , foundItems){
    if(foundItems.length === 0)
    {
      Item.insertMany(defaultItems, function(err){
        if(err)
        {
          console.log(err);
        }
        else
        {
          console.log("Successfully saved default items to  DB");
        }
      });
      res.redirect("/");
    }
    else
    {
      res.render("list" , {listTitle:"Today" , newListItems:foundItems});
    }
  });
});


app.post("/" , function(req , res)
{
        var itemName = req.body.newItem;
        const listName = req.body.list;
        const item = new Item({
          name: itemName
        });

        if(listName === "Today")
        {
          item.save();
          res.redirect("/");
        }
        else{
          List.findOne({name:listName},function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
          })
        }
});


app.post("/delete" , function(req , res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkedItemId , function(err){
      if(!err)
      {
        console.log("Successfully deleted the checked item.");
        res.redirect("/");
      }
    });
  }
  else
  {
    List.findOneAndUpdate({name: listName} , {$pull:{items: {_id: checkedItemId}}} , function(err , foundList){
      if(!err)
      {
        res.redirect("/" + listName);
      }
    });
  };

});


app.get("/:customListName" , function(req , res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err , foundList){
    if(!err)
    {
      if(!foundList)
      {
        const list = new List({
          name: customListName,
          items:defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      }
      else
      {
        res.render("list" , {listTitle:foundList.name , newListItems:foundList.items});
      }
    }
  });

});



// app.post("/work" , function(req , res){
//   let item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// })
//
//
// app.get("/about", function(req , res){
//   res.render("about");
// })

app.listen(3000 , function(req , res){
  console.log("Server started at port 3000");
});
