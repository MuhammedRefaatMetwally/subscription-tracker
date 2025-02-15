import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/user.model.js';
import {JWT_SECRET, JWT_EXPIRES_IN} from '../config/env.js'

export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {name, email, password} = req.body;

        // Check if a user already exists
        const existingUser = await User.findOne({email});

        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUsers = await User.create([{name, email, password: hashedPassword}], {session});

        const token = jwt.sign({userId: newUsers[0]._id}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});

        await session.commitTransaction();
        await session.endSession();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                token,
                user: newUsers[0],
            }
        })
    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        next(error);
    }
}

export const signIn = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email})
        if (!user) {
            const error = new Error('User does not exist');
            error.statusCode = 409;
            throw error;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const error = new Error('Invalid Password');
            error.statusCode = 409;
            throw error;
        }
        const token = jwt.sign({userId: user._id}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});

        res.status(201).json({
            success: true,
            message: 'User signed in successfully',
            data: {
                token,
                user,
            }
        })
    } catch (err) {
        next(err);
    }

}

export const signOut = async (req, res, next) => {
}