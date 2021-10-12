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
    });

    Board.associate = function(models) {
        models.Board.belongsTo(models.User)
    };
    return Board;
};