import { Button, Input, Typography } from "@material-tailwind/react";
import axios, { isAxiosError } from "axios";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../Layout";

const Login = () => {
    const [callsign, setCallsign] = useState("");
    const [password, setPassword] = useState("");

    async function login(e) {
        e.preventDefault();
        try {
            const { data } = await axios.post("/api/auth/login", {
                callsign,
                password
            });
            console.log(data);
            alert("ok");
        } catch (err) {
            alert((isAxiosError(err) && err.response?.data) || "non va");
        }
    }

    return (
        <Layout>
            <div className="mx-auto px-2 w-full md:w-2/3 mt-12">
                <Typography variant="h1" className="mb-2">
                    Login
                </Typography>

                <Typography variant="small" className="mb-6">
                    Non hai un account? <Link to="/signup">Registrati qui</Link>
                </Typography>
                <form action="#" method="post" onSubmit={login}>
                    <Input
                        type="text"
                        name="callsign"
                        label="Nominativo"
                        value={callsign}
                        onChange={e => setCallsign(e.target.value)}
                    />
                    <div className="my-4" />
                    <Input
                        type="password"
                        name="password"
                        label="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <div className="my-4" />
                    <Button type="submit">Login</Button>
                </form>
            </div>
        </Layout>
    );
};

export default Login;