import { Client, Account } from "appwrite";

export const client = new Client();

client
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject(import.meta.env.VITE_appwriteProjectId);

export const account = new Account(client);
const promise = account.createEmailSession("harshdev624@gmail.com", "pavilion");

promise.then(
    function (response) {
        console.log(response); // Success
    },
    function (error) {
        console.log(error); // Failure
    }
);

export { ID } from "appwrite";
