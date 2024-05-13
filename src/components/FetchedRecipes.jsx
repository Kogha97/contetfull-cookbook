import React, { useState, useEffect } from "react";
import { createClient } from "contentful";
import { createClient as createManagementClient } from "contentful-management";
import EnterRecipes from "./EnterRecipes";
import EditRecipes from "./EditRecipes";
import "bootstrap/dist/css/bootstrap.min.css";
import DeleteRecipes from "./DeleteRecipes";

function FetchedRecipes({ searchQuery }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const client = createClient({
    space: import.meta.env.VITE_REACT_APP_SPACE_ID,
    accessToken: import.meta.env.VITE_REACT_APP_DELIVERY_ACCESS_TOKEN,
  });

  const fetchData = async () => {
    try {
      const response = await client.getEntries();
      let items = response.items;

      if (searchQuery) {
        items = items.filter((item) =>
          item.fields.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setData(items);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (recipe) => {
    setEditingRecipe(recipe);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingRecipe(null);
  };

  const handleCancelEdit = () => {
    setEditingRecipe(null);
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery]);

  const parseIngredients = (ingredients) => {
    if (!ingredients) return [];

    if (typeof ingredients === "object") {
      return Array.isArray(ingredients) ? ingredients : [];
    }

    try {
      const parsed = JSON.parse(ingredients);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (err) {
      console.error("Error parsing ingredients:", err);
    }

    return [];
  };

  const handleDelete = async (recipeId) => {
    setIsDeleting(true);

    try {
      const managementClient = createManagementClient({
        accessToken: import.meta.env
          .VITE_REACT_APP_CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
      });

      const space = await managementClient.getSpace(
        import.meta.env.VITE_REACT_APP_SPACE_ID
      );
      const environment = await space.getEnvironment("master");

      const entry = await environment.getEntry(recipeId);

      if (entry.isPublished()) {
        await entry.unpublish();
      }

      if (
        entry &&
        entry.fields &&
        entry.fields.image &&
        entry.fields.image.sys &&
        entry.fields.image.sys.id
      ) {
        const imageId = entry.fields.image.sys.id;
        await environment.deleteAsset(imageId);
      }

      await entry.delete();

      fetchData();
    } catch (error) {
      console.error("Error deleting recipe:", error);
      setDeleteError("Error deleting recipe: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;

  const filteredData = data?.filter((item) => {
    return item.fields.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const onRecipeUpdated = () => {
    handleCloseEditModal();
    fetchData();
  };

  return (
    <div
      style={{
        backgroundColor: "#E4D8C9",
        margin: "15px",
        padding: "30px",
        borderRadius: "10px",
      }}
    >
      <h1
        style={{
          color: "#43766C",
          fontFamily: "Dancing Script, cursive",
          fontSize: "bold",
        }}
      >
        Create your own recipe book!
      </h1>
      <div className="container mt-4">
        <button
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: "#43766C" }}
          className="mb-3"
        >
          Add Recipe
        </button>

        <div
          className={showModal ? "modal fade show" : "modal fade"}
          style={showModal ? { display: "block" } : { display: "none" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enter a Recipe</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <EnterRecipes
                  onRecipeAdded={() => {
                    fetchData();
                    setShowModal(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {filteredData && filteredData.length > 0 ? (
            filteredData.map((item) => {
              console.log("Item ID:", item.sys.id);
              console.log("Item fields:", item.fields);
              console.log("Item image field:", item.fields.image);

              const imageUrl = item.fields.image?.fields?.file?.url;

              return (
                <div
                  key={item.sys.id}
                  className="col-md-4"
                  style={{ marginBottom: "20px" }}
                >
                  <div
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderTopLeftRadius: "10px",
                      borderTopRightRadius: "10px",
                      color: "#403D32",
                      minHeight: "600px",
                    }}
                    className="card h-100 rounded"
                  >
                    {imageUrl && (
                      <img
                        src={`https:${imageUrl}`}
                        alt={item.fields.image?.fields.title || "Recipe Image"}
                        className="card-img-top"
                        style={{
                          width: "100%",
                          height: "250px",
                          objectFit: "cover",
                          margin: "0",
                          padding: "0",
                          borderBottom: "1px solid #E4D8C9",
                        }}
                      />
                    )}
                    <div className="card-body row">
                      {" "}
                      <div className="col-md-12">
                        {" "}
                        <div
                          className="card-header"
                          style={{ height: "50px", overflow: "hidden" }}
                        >
                          <h2
                            className="card-title"
                            style={{
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.fields.title}
                          </h2>
                        </div>
                        <p
                          className="card-text"
                          style={{
                            fontSize: "16px",
                            lineHeight: "1.5",
                            textAlign: "justify",
                            color: "#403D32",
                            padding: "10px",
                            height: "200px",
                            overflow: "auto",
                            marginBottom: "25px",
                            marginTop: "15px",
                          }}
                        >
                          {item.fields.description}
                        </p>
                        <div
                          style={{
                            backgroundColor: "#FFDD95",
                            borderRadius: "10px",
                            color: "#403D32",
                            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                            margin: "10px",
                            padding: "10px",
                          }}
                        >
                          <h4 style={{ borderBottom: "1px solid #FF9843" }}>
                            Ingredients
                          </h4>
                          <ul
                            style={{
                              listStyleType: "none",
                              paddingLeft: "0",
                              minHeight: "120px",
                              overflow: "auto",
                            }}
                          >
                            {parseIngredients(item.fields.ingredients).map(
                              (ingredient, index) => (
                                <li key={index}>
                                  {ingredient.quantity} {ingredient.name}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div
                      className="card-footer"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      <button
                        onClick={() => handleEditClick(item)}
                        style={{ backgroundColor: "#43766C" }}
                      >
                        Edit
                      </button>

                      <DeleteRecipes
                        recipeId={item.sys.id}
                        onDelete={handleDelete}
                        isDeleting={isDeleting}
                        deleteError={deleteError}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p>No recipes found.</p>
          )}
        </div>
      </div>
      <div
        className={showEditModal ? "modal fade show" : "modal fade"}
        style={showEditModal ? { display: "block" } : { display: "none" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Recipe</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseEditModal}
              ></button>
            </div>
            <div className="modal-body">
              {editingRecipe && (
                <EditRecipes
                  recipe={editingRecipe}
                  onRecipeUpdated={onRecipeUpdated}
                  onCancel={handleCloseEditModal}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FetchedRecipes;
