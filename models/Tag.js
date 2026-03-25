const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { generateUniqueSlug } = require('../utils/slug');

const Tag = sequelize.define('Tag', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true
    },
    slug: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'tags',
    timestamps: true,
    hooks: {
        beforeValidate: async (model) => {
            if (model.name && (!model.slug || model.changed('name'))) {
                model.slug = await generateUniqueSlug(model.name, async (slug) => {
                    const where = { slug };
                    if (model.id) where.id = { [require('sequelize').Op.ne]: model.id };
                    return !!(await Tag.findOne({ where, attributes: ['id'] }));
                });
            }
        },
    }
});

module.exports = Tag;
