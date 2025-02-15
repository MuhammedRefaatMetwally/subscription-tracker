import express from 'express';
import {PORT} from './config/env.js';
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/workflow.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import connectToDatabase from "./database/mongodb.js";
import cookieParser from "cookie-parser";
import errorMiddlewares from "./middlewares/error.middlewares.js";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import workflowRouter from "./routes/workflow.routes.js";

const app = express();


app.use(express.json());
app.use(express.urlencoded({extended: false})); // to handle HTML forms
app.use(cookieParser());
app.use(arcjetMiddleware);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("api/v1/workflows", workflowRouter);
app.use(errorMiddlewares);

app.get('/', (req, res) => {
    res.send('Welcome');
})

app.listen(PORT, async () => {
    console.log(`Subscription server started at http://localhost:${PORT}`);

    await connectToDatabase()
});

export default app;