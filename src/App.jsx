import {
    Card,
    Heading,
    Image,
    InputGroup,
    InputLeftAddon,
    InputRightAddon,
    Spacer,
    Stack,
    Text,
} from "@chakra-ui/react";
import "./App.css";
import Page from "./Page";
import { Input } from "@chakra-ui/react";
import { useState } from "react";

function App() {
    const [site, setSite] = useState("");
    return (
        <div className="card2">
            <Image src="/logo1.svg" />
            <Heading mt={20} mb={10}>
                Share Clip mein aapka swagat hai
            </Heading>
            <Text fontSize="2xl">
                Please go to any url : shareclip.vercel.app/page
            </Text>
        </div>
    );
}

export default App;
