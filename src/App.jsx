import {
    Button,
    Heading,
    Image,
    InputGroup,
    InputLeftAddon,
} from "@chakra-ui/react";
import "./App.css";
import { Input } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function App() {
    const [site, setSite] = useState("");
    const navigate = useNavigate();

    const handleGoto = (e) => {
        e.preventDefault();
        navigate(`/${site}`);
    };

    return (
        <div className="card2">
            <Image src="/logo1.svg" boxSize="100px" />
            <Heading mt={20}>ShareClip mein aapka swagat hai</Heading>
            <InputGroup
                size={{ base: "sm", md: "lg" }}
                mt={8}
                maxW="600px"
                w="100%"
                mx="auto"
            >
                <InputLeftAddon>shareclip.harshshah.me/</InputLeftAddon>
                <Input
                    placeholder="mysite"
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                />
            </InputGroup>

            <Button mt={6} onClick={handleGoto}>
                Visit
            </Button>
        </div>
    );
}

export default App;
