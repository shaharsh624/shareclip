import { useEffect, useRef, useState } from "react";
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
    Input,
    Box,
    Link,
    Grid,
    GridItem,
} from "@chakra-ui/react";
import { Client, Databases, Query, ID, Storage } from "appwrite";
import { useParams } from "react-router-dom";
import { DownloadIcon } from "@chakra-ui/icons";

const Page = () => {
    const { pageName } = useParams();
    const [name, setName] = useState(pageName);
    const [text, setText] = useState("");
    const [validity, setValidity] = useState(0);
    const [remainingTime, setRemainingTime] = useState(null);
    const [found, setFound] = useState(false);
    const { onCopy, hasCopied } = useClipboard(text);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const fileNames = useRef([]);
    const fileIds = useRef([]);

    // APPWRITE
    const client = new Client()
        .setEndpoint("https://cloud.appwrite.io/v1")
        .setProject(import.meta.env.VITE_appwriteProjectId);

    const databases = new Databases(client);
    const storage = new Storage(client);

    const uploadFilesToBucket = () => {
        return new Promise((resolve, reject) => {
            const uploadPromises = uploadedFiles.map(async (file) => {
                try {
                    const response = await storage.createFile(
                        import.meta.env.VITE_appwriteBucketId,
                        ID.unique(),
                        file
                    );
                    return response.$id;
                } catch (error) {
                    console.log(error);
                    throw error;
                }
            });

            Promise.all(uploadPromises)
                .then((fileIdsArray) => {
                    fileIds.current = [...fileIdsArray, ...fileIds.current];
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    };

    const createPage = async () => {
        const creationTime = Date.now();
        const expirationTime = creationTime + validity * 1000;

        try {
            await uploadFilesToBucket();
        } catch (error) {
            console.error("Error uploading files:", error);
            return;
        }

        const promise = databases.createDocument(
            import.meta.env.VITE_appwriteDatabaseId,
            import.meta.env.VITE_appwriteCollectionId,
            ID.unique(),
            {
                name: name,
                text: text,
                validity: validity,
                expirationTime: expirationTime,
                files: fileIds.current,
            }
        );

        promise.then(
            function () {
                console.log("Page Created Successfully.");
            },
            function (error) {
                console.log(error);
            }
        );
    };

    const deleteExpiredPage = async () => {
        try {
            const response = await databases.listDocuments(
                import.meta.env.VITE_appwriteDatabaseId,
                import.meta.env.VITE_appwriteCollectionId,
                [Query.lessThan("expirationTime", Date.now())]
            );

            for (const doc of response.documents) {
                try {
                    // Delete associated files
                    for (const fileId of doc.files) {
                        await storage.deleteFile(
                            import.meta.env.VITE_appwriteBucketId,
                            fileId
                        );
                    }
                } catch (error) {
                    console.error("Error deleting files:", error);
                }

                try {
                    // Delete document after files deletion
                    await databases.deleteDocument(
                        import.meta.env.VITE_appwriteDatabaseId,
                        import.meta.env.VITE_appwriteCollectionId,
                        doc.$id
                    );
                } catch (error) {
                    console.error("Error deleting expired documents:", error);
                }
                console.log(
                    "Document and associated files deleted successfully."
                );
                setFound(false);
                setText("");
                setValidity(0);
            }
        } catch (error) {
            console.error("Error deleting expired documents:", error);
        }
    };

    const getPages = async () => {
        try {
            const response = await databases.listDocuments(
                import.meta.env.VITE_appwriteDatabaseId,
                import.meta.env.VITE_appwriteCollectionId,
                [Query.equal("name", name)]
            );

            response.documents.forEach((doc) => {
                if (doc && doc.expirationTime > Date.now()) {
                    setFound(true);
                    setName(doc.name);
                    setText(doc.text);
                    fileIds.current = doc.files;
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
            });

            const fileDetails = await Promise.all(
                fileIds.current.map(async (fileId) => {
                    const fileData = await storage.getFile(
                        import.meta.env.VITE_appwriteBucketId,
                        fileId
                    );
                    const fileUrl = storage.getFileDownload(
                        import.meta.env.VITE_appwriteBucketId,
                        fileId
                    );
                    return { name: fileData.name, url: fileUrl.href };
                })
            );

            fileNames.current = fileDetails;
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            await getPages();
            await deleteExpiredPage();
        };
        const intervalId = setInterval(fetchData, 600);

        return () => clearInterval(intervalId);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        createPage();
    };

    const handleFileChange = async (event) => {
        setUploadedFiles(Array.from(event.target.files));
        fileNames.current = Array.from(event.target.files, (file) => file.name);
    };

    return (
        <Flex direction="column" p={{ base: 4, md: 8 }} className="card">
            <FormControl>
                <Flex>
                    <Text fontSize={{ base: "3xl", md: "4xl" }}>
                        <strong>Shareclip: {name}</strong>
                    </Text>
                    <Spacer />
                    <Button
                        colorScheme="blue"
                        onClick={handleSubmit}
                        isDisabled={found}
                        size={{ base: "sm", md: "md" }}
                        mt={{ base: "0.5rem" }}
                    >
                        Create
                    </Button>
                </Flex>
                <FormLabel mt={4} mb={2} fontSize={{ base: "xl", md: "2xl" }}>
                    Validity
                </FormLabel>
                {found ? (
                    <Text fontSize="md">{remainingTime}</Text>
                ) : (
                    <Select
                        id="validity"
                        placeholder="Select Validity"
                        value={validity}
                        onChange={(event) => {
                            setValidity(parseInt(event.target.value, 10));
                        }}
                    >
                        <option value={60}>In 1 minute</option>
                        <option value={300}>In 5 minute</option>
                        <option value={600}>In 10 minute</option>
                        <option value={3600}>In 1 hour</option>
                        <option value={86400}>In 1 day</option>
                        <option value={604800}>In 1 week</option>
                        <option value={2592000}>In 1 month</option>
                    </Select>
                )}
                <Flex mt={4} mb={2}>
                    <FormLabel fontSize={{ base: "xl", md: "2xl" }}>
                        Text
                    </FormLabel>
                    <Spacer />
                    <Button
                        onClick={onCopy}
                        isDisabled={!found}
                        size={{ base: "sm", md: "md" }}
                    >
                        {hasCopied ? "Copied!" : "Copy"}
                    </Button>
                </Flex>
                <Flex gap="5" mt={0} mb={5}>
                    <Box flex="3">
                        <Textarea
                            placeholder="Write some text to share"
                            resize="none"
                            h={80}
                            w="full"
                            value={text}
                            onChange={(event) => {
                                setText(event.target.value);
                            }}
                            isReadOnly={found}
                        />
                    </Box>
                </Flex>
                <Flex gap="5" mt={0} mb={2}>
                    <FormLabel fontSize={{ base: "xl", md: "2xl" }}>
                        Files
                    </FormLabel>
                    <Spacer />
                    <Input
                        id="fileInput"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        hidden
                    />
                    <Button
                        onClick={() =>
                            document.getElementById("fileInput").click()
                        }
                        isDisabled={found}
                        size={{ base: "sm", md: "md" }}
                    >
                        Upload Files
                    </Button>
                </Flex>
                {fileNames.current.length > 0 && found && (
                    <Grid
                        gap={5}
                        templateColumns={{
                            base: "repeat(2, 1fr)",
                            md: "repeat(5, 1fr)",
                        }}
                    >
                        {fileNames.current.map((file, index) => (
                            <Link
                                key={index}
                                href={file.url}
                                // download={file}
                            >
                                <GridItem
                                    p={2}
                                    borderWidth={1}
                                    borderRadius={5}
                                >
                                    <Text>{file.name}</Text>
                                </GridItem>
                            </Link>
                        ))}
                    </Grid>
                )}
                {fileNames.current.length > 0 && !found && (
                    <Grid
                        gap={5}
                        templateColumns={{
                            base: "repeat(2, 1fr)",
                            md: "repeat(5, 1fr)",
                        }}
                    >
                        {fileNames.current.map((file, index) => (
                            <GridItem
                                key={index}
                                p={2}
                                borderWidth={1}
                                borderRadius={5}
                            >
                                <Flex>
                                    <Text>{file}</Text>
                                    <Spacer />
                                    <Link
                                        href={URL.createObjectURL(
                                            uploadedFiles[index]
                                        )}
                                        download={file}
                                    >
                                        <DownloadIcon />
                                    </Link>
                                </Flex>
                            </GridItem>
                        ))}
                    </Grid>
                )}
            </FormControl>
        </Flex>
    );
};

export default Page;
