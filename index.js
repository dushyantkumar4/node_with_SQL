const { faker } = require('@faker-js/faker');
const mysql=require("mysql2");
const express=require("express");
const app=express();
const path=require("path");
const methodOverride=require("method-override");
const { v4: uuidv4 } = require('uuid');
const port=8080;

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));


const connection=mysql.createConnection({
    host:"localhost",
    user:"root",
    database:"mern_app",
    password:"Velar@6156"
});

let getRandomUser= ()=> {
    return [
       faker.string.uuid(),
       faker.internet.username(), 
       faker.internet.email(),
       faker.internet.password(),
    ];
  }

//EDIT ROUTE
  app.get("/user/:id/edit",(req,res)=>{
    let {id}=req.params;
    let q=`SELECT * FROM user WHERE id='${id}'`;
    try{
        connection.query(q,(err,result)=>{
                if (err) throw err;
                let user=result[0];
                res.render("edit.ejs",{user});
           });
       }catch(err){
           console.log(err);
           res.send("some error in DB");
       } 
  });

    //UPDATE ROUTE
    app.patch("/user/:id",(req,res)=>{
        let {id}=req.params;
        let {password:formPass,username:newUsername}=req.body;
        let q=`SELECT * FROM user WHERE id='${id}'`;

        try{
            connection.query(q,(err,result)=>{
                    if (err) throw err;
                    let user=result[0];
                    if(formPass!=user.password){
                        res.send("wrong password");
                    }else{
                        let q2=`UPDATE user SET username='${newUsername}' WHERE id= '${id}' `;
                        connection.query(q2,(err,result)=>{
                            if(err) throw err;
                            res.redirect("/user");
                        })
                    }
               });
           }catch(err){
               console.log(err);
               res.send("some error in DB");
           } 
      });

      //Delete user
      app.get("/user/:id/delete",(req,res)=>{
        let {id}=req.params;
        let q=`SELECT * FROM user WHERE id= '${id}' `;
        try{
            connection.query(q,(err,result)=>{
                if (err) throw err;
                let user=result[0];
                res.render("delete.ejs",{user});
            });
        }catch(err){
            console.log(err)
            res.send("some error in DB")
        }
      });

      app.delete("/user/:id",(req,res)=>{
        let {id}=req.params;
        let {password:formPass,email:formEmail}=req.body;
        let q=`SELECT * FROM user WHERE id='${id}'`;

        try{
            connection.query(q,(err,result)=>{
                if(err) throw err;
                let user=result[0];
                if(formPass!=user.password && formEmail!=user.email){
                    res.send("Wrong! entry try again");
                }else{
                    let q3=`DELETE FROM user WHERE id= '${id}' AND email= '${user.email}' `;
                    connection.query(q3,(err,result)=>{
                        if(err) throw err;
                        res.redirect("/user");
                    });
                }
            });
        }catch(err){
            console.log(err);
            res.send("some error in database");
        }
      });

      //Create user
      app.get("/user/new",(req,res)=>{
        res.render("new.ejs");
      });

      app.post("/user",(req,res)=>{
        let id=uuidv4();
        let {username,password,email}=req.body;
        let q4=`INSERT INTO user (id,username,email,password) VALUES ("${id}","${username}","${email}","${password}")`;

        try{
            connection.query(q4,(err,result)=>{
                if(err) throw err;
                res.redirect("/user");
            })
        }catch(err){
            console.log(err);
            res.send("there is some error in DB");
        }
      });

  //SHOW USERS
  app.get("/user",(req,res)=>{
    let q=`SELECT * FROM user`;
    try{
        connection.query(q,(err,users)=>{
                if (err) throw err;
                res.render("showuser.ejs",{users});
           });
       }catch(err){
           console.log(err);
           res.send("some error in DB");
       } 
  });

  //count users
app.get("/",(req,res)=>{
    let q=`SELECT count(*) FROM user`;
    try{
         connection.query(q,(err,result)=>{
                if (err) throw err;
                let count=result[0]["count(*)"];
                res.render("home.ejs",{count});
            });
        }catch(err){
            console.log(err);
            res.send("some error in DB");
        } 
});

app.listen(port,()=>{
    console.log(`app is listening on port${port}`);
});

