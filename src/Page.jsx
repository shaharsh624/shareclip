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
} from "@chakra-ui/react";
import { db } from "./firebaseConfig";
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    where,
    query,
} from "firebase/firestore";
import { useParams } from "react-router-dom";

const Page = () => {
    const { pageName } = useParams();
    const [name, setName] = useState(pageName);
    const [text, setText] = useState("");
    const [validity, setValidity] = useState("");
    const [remainingTime, setRemainingTime] = useState(null);
    const [found, setFound] = useState(false);
    const { onCopy, hasCopied } = useClipboard(text);

    // FIREBASE
    const pageCollectionRef = collection(db, "pages");

    const createPage = async () => {
        const creationTime = Date.now();
        const expirationTime = creationTime + validity * 1000;

        const q = query(pageCollectionRef, where("name", "==", name));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            await addDoc(pageCollectionRef, {
                name: name,
                text: text,
                validity: Number(validity),
                creationTime,
                expirationTime,
            });
        } else {
            alert("Page already exists!");
        }
    };

    const deleteExpiredPage = async () => {
        const q = query(
            pageCollectionRef,
            where("expirationTime", "<", Date.now())
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
            setFound(false);
            setText("");
            setValidity("");
        });
    };

    const getPages = async () => {
        const q = query(pageCollectionRef, where("name", "==", name));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            if (doc && doc.data().expirationTime > Date.now()) {
                setFound(true);
                setName(doc.data().name);
                setText(doc.data().text);
                const expirationTime = doc.data().expirationTime;
                const remainingTime = expirationTime - Date.now();
                const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
                const hours = Math.floor(
                    (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
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
        return false;
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
        <div className="card">
            <h1>shareme/{name}</h1>
            <FormControl>
                <FormLabel mt={8} mb={2} className="label" fontSize="2xl">
                    Validity
                </FormLabel>
                {found ? (
                    <p fontSize="">{remainingTime}</p>
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
                <Flex mt={8} mb={2}>
                    <FormLabel className="label" fontSize="2xl">
                        Enter your Text
                    </FormLabel>
                    <Spacer />
                    <Button onClick={onCopy}>
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
        </div>
    );
};

export default Page;
