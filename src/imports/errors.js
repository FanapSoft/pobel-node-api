const errors = [
    {code: 1000, message: 'Unhandled exception'},

    {code: 2000, message: 'Not authorized'},
    {code: 2001, message: 'Invalid token or user'},
    {code: 2002, message: 'Token not provided'},
    {code: 2004, message: 'Access denied'},

    {code: 3000, message: 'Requested resource not found'},
    {code: 3001, message: 'No results'},
    {code: 3002, message: 'Invalid parameters'},
    /**
     * 3200 to 3300 is for userTarget
     */
    {code: 3200, message: 'New target should be bigger than previous target'},
    {code: 3201, message: 'You can not change your target before converting your points to money'},
    {code: 3202, message: 'Your target ended choose a new target'},
    {code: 3203, message: 'No target Or target ended'},
    {code: 3204, message: 'Please collect your points before choosing a new target'},
    /**
     * 3300 to 3350 is for datasets
     */
    {code: 3300, message: 'Labeling on this dataset is not allowed'},
    {code: 3301, message: 'You labeling budget on current dataset reached the maximum limit. Please wait until labeling on this dataset ends, then request for cash out.'},
    /**
     * 3350 to 3400 is for datasets
     */
    {code: 3350, message: 'This dataset has no items to label'},
    /**
     * 3400 to 3450 is for credit
     */
    {code: 3400, message: 'You can not collect your credit at this time'},
    /**
     * 3400 to 3500 is for wallet
     */
    {code: 3500, message: 'Add user to contacts failed'},
    {code: 3501, message: 'Transfer to wallet failed'},
    {code: 3502, message: 'You need a valid phone number to request withdraw'},
    {code: 3503, message: 'Currently we do not support withdraw funds bigger than 500,000 tomans.'},
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
