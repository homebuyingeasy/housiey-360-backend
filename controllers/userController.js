const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer'); // Use this or a similar library to send emails
const db = require('../models');
const User = db.User;
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

exports.createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Ensure all required fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        // Create the user
        const user = await User.create({ name, email, password });

        // Exclude the password from the response
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ where: { email } });

        if (!user || !(await user.validatePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Create JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Find user by ID and exclude the password from the response
        const user = await db.User.findOne({
            where: { id },
            attributes: { exclude: ['password'] },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        // Find all users and exclude the password from the response
        const users = await db.User.findAll({
            attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
        });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        // Ensure fields are provided
        if (!name && !email) {
            return res.status(400).json({ message: 'Name or email is required to update.' });
        }
        // Update the user
        const [updated] = await User.update(req.body, {
            where: { id },
        });
        if (updated) {
            const updatedUser = await User.findOne({ where: { id }, attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] } });
            res.status(200).json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;

        // Ensure required fields are provided
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required.' });
        }

        const user = await User.findOne({ where: { id } });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the current password matches
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        // Hash and update the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const user = await db.User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Generate a token and set expiration
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();

        // Send an email with the reset token (Simulate email for now)
        console.log(`Password reset token (for testing): ${resetToken}`);

        // Example email sending logic (you would replace this with actual sending)
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.NODE_MAILER_EMAIL,
                pass: process.env.NODE_MAILER_GOOGLE_APP_PASSWORD,
            },
            port: 587,
            secure: false,

            tls: {
                // do not fail on invalid certs
                rejectUnauthorized: false,
            },
        });
        let mailOptions = {
            to: user.email,
            from: process.env.EMAIL_FROM,
            subject: 'Password Reset',
            text: `You are receiving this because you have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/api/users/reset-password/${resetToken}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };
        transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'A password reset link has been sent to your email address.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ message: 'New password is required.' });
        }

        const user = await db.User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [db.Sequelize.Op.gt]: Date.now() }, // Ensure token has not expired
            },
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        // Hash and set the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear the reset token and expiration
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.status(200).json({ message: 'Your password has been updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await User.destroy({
            where: { id },
        });

        if (deleted) {
            res.status(200).json({ message: 'User deleted successfully.' });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


