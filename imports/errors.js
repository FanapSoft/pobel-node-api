const errors = [
    {
        code: 1000,
        message: 'Unhandled exception'
    },
    {
        code: 2000,
        message: 'Not authorized'
    },
    {
        code: 2001,
        message: 'Invalid token or user'
    },
    {
        code: 2002,
        message: 'Token not provided'
    },
    // {
    //     code: 2003,
    //     message: 'Token expired'
    // },
    {
        code: 2004,
        message: 'Access denied'
    },
    {
        code: 3000,
        message: 'Requested resource not found'
    },
    {
        code: 3001,
        message: 'No results'
    },
    {
        code: 3002,
        message: 'Invalid parameters'
    },

    /**
     * 3200 to 3300 is for userTarget
     */
    {
        code: 3200,
        message: 'New target should be bigger than previous target'
    },
    {
        code: 3201,
        message: 'You can not change your target before converting your points to money'
    },
    {
        code: 3202,
        message: 'Your target ended choose a new target'
    },
    {
        code: 3203,
        message: 'No target Or target ended'
    },

    /**
     * 3300 to 3400 is for datasets
     */
    {
        code: 3300,
        message: 'Labeling on this dataset has been ended'
    },


];

export function findCode(code = 1000) {
    const codeObj = errors.filter(item => item.code === code);
    return codeObj ? codeObj : {
        code: 1000,
        message: 'Unhandled exception'
    }
}

export function handleError(res,  {code = 1000, status = 500, error = null}) {
    if(!error)
       return res.status(status).send(findCode(code))
    else
       return res.status(status).send(error)
}
