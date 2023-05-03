const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require('ejs');
const _ = require("lodash");
require("dotenv").config();


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://nasilelecharles:George!3089@cluster0.gbpxtjr.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
    name: "Welcome to your todo list"
})

const item2 = new Item ({
    name: "Hit the + button to add a new item"
})

const item3 = new Item ({
    name: "<-- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3];

// Here we mean that for every new list we create, it will have a name and an array of documents associated with it.

const listSchema = {
    name: String,
    items: [itemsSchema]
};

// We now create the model for the above schema

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

    Item.find({})
    .then(foundItems => {

        if (foundItems.length === 0) {

                        Item.insertMany(defaultItems)
            .then(() => {
                console.log("Successfully saved default items to DB.");
            })
            .catch((err) => {
                console.log(err);
            });

            res.redirect("/");

        } else {
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
       
    })
    .catch(err => {
      console.log(err);
    });

}); 

app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);

    // The code below checks to see if the list we are entering already exists to avoid duplication
    List.findOne({name: customListName})
    .then(foundList => {
      if (!foundList) {

        // Create a new list

        const list = new List ({
            name: customListName,
            items: defaultItems
        })
    
        list.save();
        res.redirect("/" + customListName);
        
      } else {

        // Show an existing list
        
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    })
    .catch(err => console.error(err));

    // Headers, the name is whatever name the customer types while the items will be our default items.

   
})
// This piece of code posts our data from the web page to the server because when you enter data in the button 
// it is shown on the server. Now we need to add it back to the web page

app.post("/", function(req, res){    

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    })

    if (listName === "Today") {

        item.save();
    res.redirect("/");   
    } else {
        List.findOne({name: listName})
        .then(foundList => {
        foundList.items.push(item);
        return foundList.save();
        })
        .then(() => {
        res.redirect("/" + listName);
        })
        .catch(err => {
        // handle error
        });
    }    
});

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId)
        .then(() => {
            console.log("Successfully deleted checked item.")
            res.redirect("/");
        })
        .catch((err) => {
            console.error("Error deleting checked item:", err)            
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
    .then(foundList => {
        res.redirect("/" + listName);
    })
    .catch(err => {
     });
    }  
}); 


app.get("/work", function(req, res) {
    res.render("list", {listTitle: "work list", newListItems: workItems});
});

app.get("/about", function(req, res) {
    res.render("about");
})

app.post("/work", function(req, res) {
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

// app.listen(3000, function() {
//     console.log("Server has started on port 3000!");
// });
