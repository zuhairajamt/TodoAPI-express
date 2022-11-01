const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

// post todo
router.post(`/`, authToken, async (req, res) => {
    const { title, description } = req.body;

    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    const decode = jwt.verify(token, process.env.TOKEN_CODE);

    const schema = Joi.object({
        title: Joi.string().required().max(100).min(10),
        description: Joi.string().required().max(200),
    })

    if (!schema.validate(req.body)) {
        const todo = await prisma.todo.create({
            data: {
                user_id: decode.id,
                title,
                description,
            },
        })
        res.status(201);
        res.json({
            todo: todo,
            msg: 'todo berhasil ditambahkan',
        })
    } else {
        res.status(400);
        res.json(validation.error.details);
    }
})

// Update
router.put(`/:id`, authToken, async (req, res) => {
    const { email, password } = req.body;
    const { id } = req.params;
    const idInt = parseInt(id);

    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    const decode = jwt.verify(token, process.env.TOKEN_CODE);
    //console.log(decode);

    const hashedPassword = await bcrypt.hash(password, 10);

    const userFound = await prisma.user.findFirst({
        where: {
            id: idInt,
        },
    });

    const emailFound = await prisma.user.findFirst({
        where: {
            email: email,
            NOT: {
                id: idInt
            },
        },
    });

    if (!isEmpty(userFound)) {
        if (idInt == decode.id && !emailFound) {
            console.log('idInt: ' + idInt, ' UserId: ' + userFound.id)
            await prisma.user.update({
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
            });
        } else {
            res.status(400);
            res.json({
                msg: 'Gak berhak lol atau email udah dipakai lol',
            });
        }
    } else {
        res.status(400);
        res.json('Akun tidak ditemukan');
    };
});

// Delete
router.delete(`/:id`, authToken, async (req, res) => {
    const { id } = req.params;
    const idInt = parseInt(id);

    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    const decode = jwt.verify(token, process.env.TOKEN_CODE);
    //console.log(decode);

    const userFound = await prisma.user.findFirst({
        where: {
            id: idInt,
        },
    });

    if (!isEmpty(userFound)) {
        if (idInt == decode.id) {
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
            res.json({
                msg: 'Akun tidak berhasil dihapus',
            });
        };
    } else {
        res.status(400);
        res.json({
            msg: 'Akun tidak berhasil dihapus',
        });
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
            } else {
                req.user = user;
                next();
            }
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = router;