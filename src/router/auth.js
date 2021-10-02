import axios from "axios";
import prisma from "../prisma/prisma.module.js";
import {check} from "express-validator";

const config = {
    client_id: process.env.POD_POBEL_ACCOUNT_CLIENT_ID,
    client_secret: process.env.POD_POBEL_ACCOUNT_CLIENT_SECRET,
    redirect_uri: (process.env.NODE_ENV === 'production' ? process.env.HOST_ADDRESS : process.env.HOST_ADDRESS_LOCAL) + "/SSOCallback",
};

export default function (router) {
    router.get("/auth", function (req, res) {
        let {
            host
        } = req.query;
        let loginUrlData = {
            // ------ REQUIRED ------
            client_id: config.client_id,
            redirect_uri: config.redirect_uri,
            scope: ['profile', 'email' ],
            response_type: 'code',
        };
        let loginUrl = 'https://accounts.pod.ir/oauth2/authorize/?'
            + 'client_id=' + loginUrlData.client_id

            + '&response_type=code'
            + '&scope=' + loginUrlData.scope.join(' ')
            + '&redirect_uri=' + loginUrlData.redirect_uri + '?host=' + encodeURI(host)

        res.redirect(loginUrl);
    });

    router.get("/SSOCallback", [
        check('host').optional({checkFalsy: true}).isLength({max: 50})
    ], async function (req, res) {
        let {
            code,
            host
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

        const tokens = await fetchUserTokens(code, host);
        if(!tokens || (tokens.response && tokens.response.data.error)) {
            res.status(500).send({error: tokens.response.data.error, message: 'POBEL Error: Unable to fetch user token'})
            return;
        }

        const profile = await getUserData(tokens.data.access_token);
        if(!profile || (profile.response && profile.response.data.error)) {
            res.status(500).send({error: profile.response.data.error, message: 'POBEL Error: Unable to fetch user profile'})
            return;
        }

        let user = await prisma.user.findUnique({
            where: {
                PodUserId: profile.data.id
            }
        });


        if(!user) {
            user = await prisma.user.create({
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
            user = await prisma.user.update({
                where: {
                    PodUserId: profile.data.id
                },
                data: {
                    UserName: profile.data.preferred_username,
                    Email: profile.data.email,
                    Name: profile.data.given_name,
                    PodUserId: profile.data.id,
                    SSOProfile: profile.data,
                    Tokens: tokens.data,
                    RefreshToken: tokens.data.refresh_token,
                    LocalToken: tokens.data.id_token,
                    TokenExpiresAt: new Date(new Date().setDate(new Date().getDate() + 4)).toISOString()
                }
            });
        }

        let conf = {
            HOST_URL: (process.env.NODE_ENV === 'production' ? process.env.DEFAULT_CLIENT_URL_PROD : process.env.DEFAULT_CLIENT_URL_LOCAL),
        };
        host = host ? host : conf.HOST_URL
        res.redirect(host + "/loggedIn/" + user.Id + "?token=" + tokens.data.id_token);
    });

    async function fetchUserTokens(code, host) {
        let params = {
            code: code,
            Client_id: config.client_id,//First char uppercase
            Client_secret: config.client_secret,//First char uppercase
            redirect_uri: config.redirect_uri + '?host=' + encodeURI(host),
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
            Client_id: config.client_id,
            Client_secret: config.client_secret,
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
