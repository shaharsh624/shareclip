import { Client, Account } from "appwrite";

const client = new Client()
    .setEndpoint("https://cloud.appwrite.io/v1") // Your API Endpoint
    .setProject(import.meta.env.VITE_appwriteProjectId); // Your project ID

const account = new Account(client);

const promise = account.createEmailPasswordSession(
    "harshdev624@gmail.com",
    "pavilion"
);

promise.then(
    function (response) {
        console.log(response); // Success
    },
    function (error) {
        console.log(error); // Failure
    }
);
