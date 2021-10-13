export default (sequelize, DataTypes) => {
    const Board = sequelize.define("board", {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        // createdAt: false,
        // updatedAt: false
    });

    Board.associate = function(models) {
        models.Board.belongsTo(models.User)
    };
    return Board;
};