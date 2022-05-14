const express = require("express");
const bodyParser = require("body-parser");
const dateFind = require(__dirname + "/date.js");
let day = dateFind();
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs"); 

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin-Jef:Testi1234@cluster0.quyw6.mongodb.net/toDoListDB");

const listItemSchema = {
    name: String
};
const ListItem = mongoose.model("ListItem", listItemSchema);

const listItem1 = new ListItem({
    name: "Bring Food"
});
const listItem2 = new ListItem({
    name: "Cook Food"
});
const listItem3 = new ListItem({
    name: "Eat Food"
});

const defaultListItems = [];

const customlistItemSchema = {
    name: {
        type: String,
        required: [true, "Enter the name"],
    },
    items: [listItemSchema]
};

const NewListItem = mongoose.model("customListItem", customlistItemSchema);




app.get("/", function (req, res) {
    
    ListItem.find({}, function (err, listItems) {
        if(err) console.log(err);
        if (listItems.length === 0) {
            ListItem.insertMany(defaultListItems, function (err) {
                if(err) console.log(err);
                else console.log("Succesfully saved all the list items to toDoListDB!");
            });
            res.redirect("/");
        }
        else{
                res.render("list", {listTitle: day, newListItem: listItems});
            }
    });

});

app.get("/:customListName", function (req, res) {


    NewListItem.findOne({name: _.capitalize(req.params.customListName) }, function (err, foundList) {
        if (err){
            console.log(err)
        }
        if (!foundList) {
            const customItem = new NewListItem({
                name: _.capitalize(req.params.customListName),
                items: []
            });
            customItem.save();
            res.redirect("/" + req.params.customListName);
        }
        else{
            res.render("List", {listTitle: foundList.name, newListItem: foundList.items});
        }
    });


 });


app.post("/", function (req,res) {
    const newListItem = new ListItem({
        name: req.body.newItem
    });

    if (req.body.list === day) {
        newListItem.save();
        res.redirect("/");
    }
    else
    {
        NewListItem.findOne({name: req.body.list}, function (err, foundList) {
            if (err){
                console.log(err)
            }
            if (foundList) {
                foundList.items.push(newListItem);
                foundList.save();
                res.redirect("/" + req.body.list);
            }
        });
    }
    
});

app.post("/delete", function (req, res) {
    const delItem = req.body.checkedBox;
    const listName = req.body.listName;

    if (listName === day) {
        console.log(listName);
        console.log(delItem + "/././");
        ListItem.findByIdAndRemove(delItem, function (err) {
            if (err) {
                console.log(err);
            } else 
            {
                console.log("Data deleted");
                res.redirect("/");
            }
        });
    }
    else{
        console.log(listName);
        console.log(req.body.checkedBox + "/././");

        NewListItem.findOneAndUpdate({name: listName}, {$pull: {items: {_id: delItem}}}, function (err, foundList) {
            if (err) {
                console.log(err);
            } else 
            {
                console.log("Data deleted");
                res.redirect("/" + listName); 
            }
        });

    }

});

 app.get("/about", function (req, res) {
    res.render("about");
 });

app.listen(process.env.PORT || 3000, function () {
    console.log("Server started on port 3000");
});