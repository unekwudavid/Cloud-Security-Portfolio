/*
 * SCIM User Store
 *
 * Represents the external SaaS application's
 * local identity directory.
 */

const users = [];

function createUser(user) {
    users.push(user);
    return user;
}

function getUsers() {
    return users;
}

function getUserById(id) {
    return users.find(user => user.id === id);
}

function getUserByUserName(userName) {
    return users.find(
        user => user.userName === userName
    );
}

function updateUser(id, updatedUser) {
    const index = users.findIndex(
        user => user.id === id
    );

    if (index === -1) {
        return null;
    }

    users[index] = {
        ...users[index],
        ...updatedUser
    };

    return users[index];
}

function deleteUser(id) {
    const index = users.findIndex(
        user => user.id === id
    );

    if (index === -1) {
        return false;
    }

    users.splice(index, 1);

    return true;
}

module.exports = {
    createUser,
    getUsers,
    getUserById,
    getUserByUserName,
    updateUser,
    deleteUser
};