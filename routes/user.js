const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const bcrypt = require('bcrypt');

// Register
router.post(`/register`, async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    //console.log(password);
    const userFound = await prisma.user.findMany({
        where: {
            email: email
        },
    })

    function isEmpty(obj) {
        return !obj || Object.keys(obj).length === 0;
    }

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

module.exports = router;