const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register
router.post(`/`, async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    //console.log(password);
    const userFound = await prisma.user.findMany({
        where: {
            email: email
        },
    })

    if (isEmpty(userFound)) {
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        })
        res.status(201);
        res.json({
            msg: 'Akun berhasil terdaftar silakan login',
        })
    } else {
        res.status(400);
        res.json('Email sudah terdaftar');
    }
})

// Update
router.put(`/:id`, authToken, async (req, res) => {
    const { email, password } = req.body;
    const { id } = req.params;
    const idInt = parseInt(id);

    const hashedPassword = await bcrypt.hash(password, 10);

    const userFound = await prisma.user.findFirst({
        where: {
            id: idInt,
        },
    });

    if (!isEmpty(userFound)) {
        const update = await prisma.user.update({
            where: {
                id: idInt
            },
            data: {
                email: email,
                password: hashedPassword,
            }
        });
        res.status(201);
        res.json({
            msg: 'Akun berhasil diupdate',
            data: update
        });
    } else {
        res.status(400);
        res.json('Akun tidak ditemukan');
    };
});

// Delete
router.delete(`/:id`, authToken, async (req, res) => {
    const { id } = req.params;
    const idInt = parseInt(id);

    const userFound = await prisma.user.findFirst({
        where: {
            id: idInt,
        },
    });

    if (!isEmpty(userFound)) {
        await prisma.user.delete({
            where: {
                id: idInt
            },
        });
        res.status(201);
        res.json({
            msg: 'Akun berhasil dihapus',
        });
    } else {
        res.status(400);
        res.json('Akun tidak ditemukan');
    };
});

function isEmpty(obj) {
    return !obj || Object.keys(obj).length === 0;
};

function authToken(req, res, next) {
    //https://stackabuse.com/authentication-and-authorization-with-jwts-in-express-js/
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.TOKEN_CODE, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = router;