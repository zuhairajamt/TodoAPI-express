const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
        where: {
            email: email,
        },
    });

    function isEmpty(obj) {
        return !obj || Object.keys(obj).length === 0;
    }

    if (isEmpty(user)) {
        res.status(400);
        res.json('Email belum terdaftar atau password salah');
    } else {
        // Token
        const payload = {
            id: user.id,
            email: user.email,
        };

        const token = jwt.sign(payload, process.env.TOKEN_CODE, { expiresIn: 2000 });

        const hashedPassword = bcrypt.compareSync(password, user.password);

        if (hashedPassword) {
            res.status(200);
            res.json({
                msg: 'Berhasil login',
                token: token,
            })
        } else {
            res.status(400);
            res.json('Email belum terdaftar atau password salah');
        };
    }
})

module.exports = router;