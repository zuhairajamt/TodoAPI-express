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
        title: Joi.string().required().max(100).min(1),
        description: Joi.string().required().max(200),
    });

    const validation = schema.validate({ title: title, description: description });

    switch (validation) {
        case validation:
            const todo = await prisma.todo.create({
                data: {
                    user_id: decode.id,
                    title,
                    description,
                },
            });
            res.status(201);
            res.json({
                todo: todo,
                msg: 'todo berhasil ditambahkan',
            });
            break;
        case !validation:
            res.status(400);
            res.json({
                status: validation.error,
                msg: 'todo gagal ditambahkan',
            });
            break;
    };
})

// Update todo
router.put(`/:id`, authToken, async (req, res) => {
    const { title, description, completed } = req.body;
    const { id } = req.params;
    const idInt = parseInt(id);

    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    const decode = jwt.verify(token, process.env.TOKEN_CODE);
    //console.log(decode);
    const todoFound = await prisma.todo.findFirst({
        where: {
            user_id: decode.id,
            AND: {
                id: idInt
            },
        },
    });
    const schema = Joi.object({
        title: Joi.string().required().max(100).min(1),
        description: Joi.string().required().max(200),
        completed: Joi.number().min(0).max(1),
    });

    const validation = schema.validate({ title: title, description: description, completed: completed });

    // console.log(todoFound.user_id + 'wdadwawd' + idInt);
    //console.log(todoFound.user_id + 'decode: ' + decode.id);
    //console.log(todoIdFound.id);

    if (todoFound) {
        await prisma.todo.update({
            where: {
                id: idInt
            },
            data: {
                title: title,
                description: description,
                completed: completed,
                user_id: decode.id,
            }
        });
        res.status(201);
        res.json({
            msg: 'Todo berhasil diupdate',
        });
    } else {
        res.status(400);
        res.json({
            status: validation.error,
            msg: 'todo gagal diupdate',
        });
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

    const todoFound = await prisma.todo.findFirst({
        where: {
            user_id: decode.id,
        },
    });

    if (todoFound) {
        const todoDeleted = await prisma.todo.delete({
            where: {
                id: idInt
            },
        });
        res.status(201);
        res.json({
            data: todoDeleted,
            msg: 'Akun berhasil dihapus',
        });
    } else {
        res.status(400);
        res.json({
            msg: 'Akun tidak berhasil dihapus',
        });
    };
});

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