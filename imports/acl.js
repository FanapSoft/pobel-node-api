class Acl {
    constructor() {
        this.ADMIN = 'admin';
        this.GUEST = 'guest';
        this.USER = 'user'
    }

    currentUserCan(currentUser, userToModify, action) {
        if(!currentUser)
            return false;

        if(!userToModify && currentUser.Role !== this.ADMIN) {
            return false
        }

        switch (currentUser.Role) {
            case this.ADMIN:
                return true;
            case this.GUEST:
                return false;
            case this.USER:
                if(currentUser.Id === userToModify.Id) {
                    switch (action) {
                        case 'modify':
                        case 'viewOne':
                            return true;
                        case 'delete':
                            return false;
                    }
                } else {
                    return false;
                }
        }
    }
}

export default new Acl()
