const DeleteRecipes = ({ recipeId, onDelete, isDeleting, deleteError }) => {
  const handleDelete = (e) => {
    e.preventDefault();
    onDelete(recipeId);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <form onSubmit={handleDelete}>
        <button
          type="submit"
          disabled={isDeleting}
          style={{
            padding: "5px 10px",
            fontSize: "0.8rem",
            backgroundColor: "#E4D8C9",
          }}
        >
          {isDeleting ? "Deleting..." : "Delete Recipe"}
        </button>
      </form>
      {deleteError && <p>Error deleting recipe: {deleteError}</p>}
    </div>
  );
};

export default DeleteRecipes;
