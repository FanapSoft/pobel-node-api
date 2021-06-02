import axios from "axios";
import prisma from "../prisma/prisma.module";

const config = {
    client_id: '19503853ya6d44dd186846fa5c2f6ea9d',
    client_secret: 'e4df0524ed104540',
    redirect_uri: "http://localhost:8080/SSOCallback",
}

export default function (router) {
    router.get("/auth", function (req, res) {
        let loginUrlData = {
            // ------ REQUIRED ------
            client_id: config.client_id,
            redirect_uri: config.redirect_uri,
            scope: ['profile', 'email' ],
            response_type: 'code',
        };
        let loginUrl = 'https://accounts.pod.ir/oauth2/authorize/?'
            + 'client_id=' + loginUrlData.client_id
            + '&redirect_uri=' + loginUrlData.redirect_uri
            + '&response_type=code'
            + '&scope=' + loginUrlData.scope.join(' ');

        res.redirect(loginUrl);
    });

    router.get("/SSOCallback", async function (req, res) {
        const {
            code
        } = req.query;

        if(!code) {
            let error = null;
            if(req.query.error) {
                error = {
                    error: req.query.error,
                }
            }

            res.status(500).send({error: error.error});
            return;
        }

        const tokens = await fetchUserTokens(code);
        if(!tokens || (tokens.response && tokens.response.data.error)) {
            res.status(500).send({error: tokens.response.data.error, message: 'POBEL Error: Unable to fetch user token'})
            return;
        }

        const profile = await getUserData(tokens.data.access_token);
        if(!profile || (profile.response && profile.response.data.error)) {
            res.status(500).send({error: profile.response.data.error, message: 'POBEL Error: Unable to fetch user profile'})
            return;
        }

        const user = await prisma.user.findUnique({
            where: {
                PodUserId: profile.data.id
            }
        });

        if(!user) {
            await prisma.user.create({
                data:{
                    UserName: profile.data.preferred_username,
                    Email: profile.data.email,
                    Name: profile.data.given_name,
                    Surname: profile.data.family_name,
                    Role: 'user',
                    PodUserId: profile.data.id,
                    SSOProfile: profile.data,
                    Tokens: tokens.data
                }
            });
        } else {
            await prisma.user.update({
                where: {
                    PodUserId: profile.data.id
                },
                data:{
                    UserName: profile.data.preferred_username,
                    Email: profile.data.email,
                    Name: profile.data.given_name,
                    PodUserId: profile.data.id,
                    SSOProfile: profile.data,
                    Tokens: tokens.data,
                    RefreshToken: tokens.data.refresh_token,
                    LocalToken: tokens.data.id_token,
                    TokenExpiresAt: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString()//.setDate(new Date().getDate() + 1)
                }
            });
        }

        res.redirect("/loggedIn?token=" + tokens.data.id_token);

        // res.json({
        //     message: { profile: profile.data, tokens: tokens.data }
        // });

    });

    async function fetchUserTokens(code) {
        let params = {
            code: code,
            Client_id: config.client_id,//First char uppercase
            Client_secret: config.client_secret,//First char uppercase
            redirect_uri: config.redirect_uri,
            grant_type: 'authorization_code',
        };
        try {
            const tokens = await axios({
                method: 'post',
                url:"https://accounts.pod.ir/oauth2/token",
                params: params,
                headers: {
                    Host:"accounts.pod.ir",
                    Content_Type: 'application/x-www-form-urlencoded *',
                }
            });

            if(tokens.data) {
                return tokens
            }
        } catch (e) {
            return e
        }
    }

    async function getUserData(accessToken) {
        let params = {
            // ------ REQUIRED ------
            Client_id: '19503853ya6d44dd186846fa5c2f6ea9d',
            Client_secret: 'e4df0524ed104540'
        };

        try {
            const profile = await axios({
                method: 'get',
                url:"https://accounts.pod.ir/users",
                params: params,
                headers: {
                    Authorization: 'Bearer ' + accessToken,
                }
            });

            return profile
        } catch (e) {
            return e
        }
    }
}
