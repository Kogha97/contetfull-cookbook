import React, { useState, useRef } from "react";
import { createClient } from "contentful-management";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EnterRecipes = ({ onRecipeAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const nextId = useRef(0);
  const [ingredients, setIngredients] = useState([
    { id: nextId.current++, name: "", quantity: "" },
  ]);
  const [imageFile, setImageFile] = useState(null);

  const handleIngredientChange = (id, key, value) => {
    setIngredients(
      ingredients.map((ingredient) =>
        ingredient.id === id ? { ...ingredient, [key]: value } : ingredient
      )
    );
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: nextId.current++, name: "", quantity: "" },
    ]);
  };

  const removeIngredient = (id) => {
    setIngredients(ingredients.filter((ingredient) => ingredient.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required.", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
      });
      return;
    }

    if (description.length < 20) {
      toast.error("Description must be at least 20 characters.", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
      });
      return;
    }

    if (description.length > 600) {
      toast.error("Description must not exceed 600 characters.", {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
      });
      return;
    }

    const hasCompleteIngredient = ingredients.some(
      (ingredient) => ingredient.name.trim() && ingredient.quantity.trim()
    );

    if (!hasCompleteIngredient) {
      toast.error(
        "At least one complete ingredient (with both name and quantity) is required.",
        {
          position: toast.POSITION.TOP_CENTER,
          autoClose: 5000,
        }
      );
      return;
    }

    const client = createClient({
      accessToken: import.meta.env
        .VITE_REACT_APP_CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
    });

    const space = await client.getSpace(
      import.meta.env.VITE_REACT_APP_SPACE_ID
    );
    const environment = await space.getEnvironment("master");

    let imageAsset;
    if (imageFile) {
      imageAsset = await environment.createAssetFromFiles({
        fields: {
          title: {
            "en-US": `Image for ${title}`,
          },
          file: {
            "en-US": {
              contentType: imageFile.type,
              fileName: imageFile.name,
              file: imageFile,
            },
          },
        },
      });

      await imageAsset.processForAllLocales();
      imageAsset = await environment.getAsset(imageAsset.sys.id);
      await imageAsset.publish();
    }

    const entry = await environment.createEntry("recipes", {
      fields: {
        title: { "en-US": title },
        description: { "en-US": description },
        ingredients: { "en-US": ingredients },
        image: imageAsset
          ? {
              "en-US": {
                sys: { type: "Link", linkType: "Asset", id: imageAsset.sys.id },
              },
            }
          : null,
      },
    });

    await entry.publish();
    console.log("Entry and Image Published:", entry);
    if (onRecipeAdded) {
      onRecipeAdded();
    }

    setTitle("");
    setDescription("");
    setIngredients([{ id: nextId.current++, name: "", quantity: "" }]);
    setImageFile(null);

    nextId.current = 0;
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="text-white p-4 rounded"
      style={{
        margin: "20px 0",
        borderRadius: "10px",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
        backgroundColor: "#E4D8C9",
      }}
    >
      <div className="mb-3">
        <label htmlFor="title" className="form-label">
          Title:
        </label>
        <input
          type="text"
          className="form-control"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="description" className="form-label">
          Description:
        </label>
        <textarea
          className="form-control"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      {ingredients.map((ingredient) => (
        <div key={ingredient.id} className="mb-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Ingredient Name"
              value={ingredient.name}
              onKeyPress={handleKeyPress}
              onChange={(e) =>
                handleIngredientChange(ingredient.id, "name", e.target.value)
              }
            />
            <input
              type="text"
              className="form-control"
              placeholder="Quantity"
              value={ingredient.quantity}
              onKeyPress={handleKeyPress}
              onChange={(e) =>
                handleIngredientChange(
                  ingredient.id,
                  "quantity",
                  e.target.value
                )
              }
            />
            {ingredients.length > 1 && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => removeIngredient(ingredient.id)}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
      <div className="mb-3">
        <button
          type="button"
          onClick={addIngredient}
          style={{ backgroundColor: "#43766C" }}
        >
          Add Ingredient
        </button>
      </div>
      <div className="mb-3">
        <label htmlFor="image" className="form-label">
          Image:
        </label>
        <input
          type="file"
          className="form-control"
          id="image"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
      </div>
      <button type="submit" style={{ backgroundColor: "#43766C" }}>
        Submit
      </button>
    </form>
  );
};

export default EnterRecipes;
