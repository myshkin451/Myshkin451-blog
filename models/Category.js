const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { generateUniqueSlug } = require('../utils/slug');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    slug: {
        type: DataTypes.STRING(60),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'categories',
    timestamps: true,
    hooks: {
        beforeValidate: async (model) => {
            if (model.name && (!model.slug || model.changed('name'))) {
                model.slug = await generateUniqueSlug(model.name, async (slug) => {
                    const where = { slug };
                    if (model.id) where.id = { [require('sequelize').Op.ne]: model.id };
                    return !!(await Category.findOne({ where, attributes: ['id'] }));
                });
            }
        },
    }
});

module.exports = Category;
