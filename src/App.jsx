import {
    Button,
    Heading,
    Image,
    InputGroup,
    InputLeftAddon,
    Text,
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
            <Image src="/logo1.svg" />
            <Heading mt={20} mb={10}>
                Share Clip mein aapka swagat hai
            </Heading>
            <Text fontSize="2xl">
                Please go to any url : shareclip.vercel.app/page
            </Text>
            <InputGroup size="lg" mt={8} maxW="600px" w="100%" mx="auto">
                <InputLeftAddon>shareclip.vercel.app/</InputLeftAddon>
                <Input
                    placeholder="mysite"
                    value={site}
                    onChange={(e) => setSite(e.target.value)}
                />
                <Button ms={5} onClick={handleGoto}>
                    Visit
                </Button>
            </InputGroup>
        </div>
    );
}

export default App;
