const express=require('express')
const path=require('path')
const bodyParser=require('body-parser')
const helmet=require('helmet')
const dbPath=path.join(__dirname,'database.db')
const sqlite3=require('sqlite3')
const {open}=require('sqlite')
const cors=require('cors')
const app=express()
app.use(express.json())
app.use(bodyParser.json())
app.use(cors())
app.use(helmet())

app.use(express.urlencoded({extended:true}))
let db=null

const InitializingDataBase=async ()=>{
    try {
        db=await open({
            filename: dbPath,
            driver: sqlite3.Database
        })
    
        app.listen(3000,()=>{
            console.log('Server is Starting...')
        })
    }
    catch (e) {
        console.log(`DataBase Error ${e.message}`)
        process.exit(1)
    }
}
InitializingDataBase()

// to get the all todo Elements
app.get("/todo/",async (request,response)=>{
    const getTodoQuery=`
    
    SELECT
        *
    FROM
        todo;
    
    `
    const getTodo=await db.all(getTodoQuery);
    response.send(getTodo);
})

// to get insert a todo

app.post("/addTodo/",async (request,response)=>{
    try {
        const {todoDetails}=request.body;
        
        const {text,ischecked}=todoDetails;
        const addTodoQuery=`
        
        INSERT INTO
            todo(text,ischecked)
        VALUES(
                '${text}',
                ${ischecked}
        );
        `
        const addTodo=await db.run(addTodoQuery)
        response.status(200).send({addTodo})

    } catch(e) {
        console.error(`Error : ${e.message}`);
        response.status(500).send("Error inserting Todo");
    }
    
  
})

app.get("/todo/:id",async (request,response)=>{
    const {id}=request.params;
    const getEachTodoQuery=`
    SELECT
    *
    FROM
    todo
    WHERE
    id=${id};
    `;
    const getEachTodo=await db.get(getEachTodoQuery);
    response.send(getEachTodo);

})

app.delete("/todo/:deleteId/",async (request,response)=>{
    try {
        const {deleteId}=request.params;
        const deleteTodoQuery=`
        DELETE FROM
            todo
        WHERE
            id=${deleteId};
        `;
        await db.run(deleteTodoQuery);
        response.status(200).send("Deleted successfully");
    } catch (e) {
        console.error(`Error : ${e.message}`)
        response.status(400).send('Error in deleting todo')
    }

})

app.patch("/todoDelete/:updateId/",async (request,response)=>{
    
    try {
        
        const {updateDetails}=request.body;
        const getTodoItemQuery=`
        
        SELECT
            *
        FROM
            todo
        WHERE
            id=${updateDetails}    ;
        
        `
        const getTodoItem=await db.get(getTodoItemQuery);
       
        const ischecked=getTodoItem.ischecked===0?1:0;
        
        const updateTodoQuery=`
        UPDATE 
            todo
        SET
            ischecked = ${ischecked}
        WHERE
            id=${updateDetails};
        `;
    await db.run(updateTodoQuery);
    response.status(200).send("Data updated successfully");
    } catch (e) {
        console.error(`Error : ${e.message}`)
        response.status(400).send("Error in updating the data")
    }

})