export default function (prisma) {
    prisma.$use(async (params, next) => {
        // Check incoming query type
        if (params.model == 'TargetDefinitions') {
            if (params.action == 'delete') {
                // Delete queries
                // Change action to an update
                params.action = 'update'
                params.args['data'] = { Deleted: true }
            }
            if (params.action == 'deleteMany') {
                // Delete many queries
                params.action = 'updateMany'
                if (params.args.data != undefined) {
                    params.args.data['Deleted'] = true
                } else {
                    params.args['data'] = { Deleted: true }
                }
            }
        }
        return next(params);
    })

    prisma.$use(async (params, next) => {
        if (params.model == 'TargetDefinitions') {
            if (params.action == 'findUnique') {
                // Change to findFirst - you cannot filter
                // by anything except ID / unique with findUnique
                params.action = 'findFirst'
                // Add 'deleted' filter
                // ID filter maintained
                params.args.where['Deleted'] = false
            }
            if (params.action == 'findMany') {
                // Find many queries
                if (params.args.where != undefined) {
                    if (params.args.where.deleted == undefined) {
                        // Exclude deleted records if they have not been explicitly requested
                        params.args.where['Deleted'] = false
                    }
                } else {
                    params.args['where'] = { Deleted: false }
                }
            }
        }
        return next(params)
    })

    prisma.$use(async (params, next) => {
        if (params.model == 'TargetDefinitions') {
            if (params.action == 'update') {
                // Change to updateMany - you cannot filter
                // by anything except ID / unique with findUnique
                params.action = "updateMany";
                // Add 'deleted' filter
                // ID filter maintained
                params.args.where['Deleted'] = false
            }
            if (params.action == 'updateMany') {
                if (params.args.where != undefined) {
                    params.args.where['Deleted'] = false
                } else {
                    params.args['where'] = { Deleted: false }
                }
            }
        }
        return next(params)
    })
}
