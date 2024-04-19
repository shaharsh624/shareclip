import { useEffect, useState } from "react";
import {
    Textarea,
    Button,
    Select,
    FormControl,
    FormLabel,
    useClipboard,
    Flex,
    Spacer,
    Text,
} from "@chakra-ui/react";
import { Client, Databases, Query } from "appwrite";
import { ID } from "./lib/appwrite";
import { useParams } from "react-router-dom";

const Page = () => {
    const { pageName } = useParams();
    const [name, setName] = useState(pageName);
    const [text, setText] = useState("");
    const [validity, setValidity] = useState("");
    const [remainingTime, setRemainingTime] = useState(null);
    const [found, setFound] = useState(false);
    const { onCopy, hasCopied } = useClipboard(text);

    // APPWRITE
    const client = new Client()
        .setEndpoint("https://cloud.appwrite.io/v1")
        .setProject(import.meta.env.VITE_appwriteProjectId);

    const databases = new Databases(client);

    // FIREBASE
    // const pageCollectionRef = collection(db, "pages");

    const createPage = async () => {
        const creationTime = Date.now();
        const expirationTime = creationTime + validity * 1000;

        // const q = query(pageCollectionRef, where("name", "==", name));
        // const querySnapshot = await getDocs(q);
        // if (querySnapshot.empty) {
        const promise = databases.createDocument(
            "66228e3f73e9e6326fd3",
            "66228e4a5e2573d7aab7",
            ID.unique(),
            {
                name: name,
                text: text,
                validity: validity,
                expirationTime: expirationTime,
            }
        );
        promise.then(
            function (response) {
                console.log(response);
            },
            function (error) {
                console.log(error);
            }
        );
        // } else {
        // alert("Page already exists!");
        // }
    };

    const deleteExpiredPage = async () => {
        let promise1 = databases.listDocuments(
            "66228e3f73e9e6326fd3",
            "66228e4a5e2573d7aab7",
            [Query.lessThan("expirationTime", Date.now())]
        );

        promise1.then(
            function (response) {
                response.documents.forEach((doc) => {
                    const promise = databases.deleteDocument(
                        "66228e3f73e9e6326fd3",
                        "66228e4a5e2573d7aab7",
                        doc.$id
                    );
                    promise.then(
                        function (response) {
                            console.log(response); // Success
                            setFound(false);
                            setText("");
                            setValidity("");
                        },
                        function (error) {
                            console.log(error); // Failure
                        }
                    );
                    console.log(response); // Success
                });
            },
            function (error) {
                console.log(error); // Failure
            }
        );
    };

    const getPages = async () => {
        let promise = databases.listDocuments(
            "66228e3f73e9e6326fd3",
            "66228e4a5e2573d7aab7",
            [Query.equal("name", name)]
        );

        promise.then(
            function (response) {
                response.documents.forEach((doc) => {
                    if (doc && doc.expirationTime > Date.now()) {
                        setFound(true);
                        setName(doc.name);
                        setText(doc.text);
                        const expirationTime = doc.expirationTime;
                        const remainingTime = expirationTime - Date.now();
                        const days = Math.floor(
                            remainingTime / (1000 * 60 * 60 * 24)
                        );
                        const hours = Math.floor(
                            (remainingTime % (1000 * 60 * 60 * 24)) /
                                (1000 * 60 * 60)
                        );
                        const minutes = Math.floor(
                            (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
                        );
                        const seconds = Math.floor(
                            (remainingTime % (1000 * 60)) / 1000
                        );
                        setRemainingTime(
                            `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`
                        );
                    }
                    return true;
                });
            },
            function (error) {
                console.log(error);
                return false;
            }
        );
    };

    useEffect(() => {
        const intervalId = setInterval(deleteExpiredPage, 100);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            getPages();
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);

    const handleInputChange = (event) => {
        setText(event.target.value);
    };

    const handleSelectChange = (event) => {
        setValidity(event.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createPage();
    };

    return (
        <Flex direction="column" p={{ base: 4, md: 8 }} className="card">
            <Text fontSize={{ base: "3xl", md: "4xl" }}>{name}</Text>
            <FormControl>
                <FormLabel mt={8} mb={2} fontSize={{ base: "xl", md: "2xl" }}>
                    Validity
                </FormLabel>
                {found ? (
                    <Text fontSize="md">{remainingTime}</Text>
                ) : (
                    <Select
                        placeholder="Select Validity"
                        value={validity}
                        onChange={handleSelectChange}
                    >
                        <option value={60}>In 1 minute</option>
                        <option value={300}>In 5 minute</option>
                        <option value={600}>In 10 minute</option>
                        <option value={3600}>In 1 hour</option>
                        <option value={86400}>In 1 day</option>
                        <option value={604800}>In 1 week</option>
                        <option value={18144000}>In 1 month</option>
                    </Select>
                )}
                <Flex mt={8} mb={2} direction={{ base: "column", md: "row" }}>
                    <FormLabel fontSize={{ base: "xl", md: "2xl" }}>
                        Enter your Text
                    </FormLabel>
                    <Spacer />
                    <Button mt={{ base: 2, md: 0 }} onClick={onCopy}>
                        {hasCopied ? "Copied!" : "Copy"}
                    </Button>
                </Flex>
                <Textarea
                    placeholder="Write some text to share"
                    resize="none"
                    h={80}
                    w="full"
                    value={text}
                    onChange={handleInputChange}
                    isReadOnly={found}
                />
                <Button
                    colorScheme="blue"
                    mt={8}
                    mb={2}
                    onClick={handleSubmit}
                    isDisabled={found}
                >
                    Create
                </Button>
            </FormControl>
        </Flex>
    );
};

export default Page;
