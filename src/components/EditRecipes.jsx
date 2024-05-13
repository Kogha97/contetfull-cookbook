import React, { useState, useEffect, useRef } from "react";
import { createClient } from "contentful-management";
import "react-toastify/dist/ReactToastify.css";

const EditRecipes = ({ recipe, onRecipeUpdated, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(true);
  const [isEditingDescription, setIsEditingDescription] = useState(true);
  const [environment, setEnvironment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const nextId = useRef(0);

  useEffect(() => {
    const initContentful = async () => {
      try {
        const client = createClient({
          accessToken: import.meta.env
            .VITE_REACT_APP_CONTENTFUL_MANAGEMENT_ACCESS_TOKEN,
        });
        const space = await client.getSpace(
          import.meta.env.VITE_REACT_APP_SPACE_ID
        );
        const env = await space.getEnvironment("master");
        setEnvironment(env);
      } catch (error) {
        console.error("Error initializing Contentful:", error);
      }
    };
    initContentful();

    if (recipe) {
      setTitle(recipe.fields.title || "");
      setDescription(recipe.fields.description || "");
      setIngredients(
        recipe.fields.ingredients?.map((ing, index) => ({
          ...ing,
          id: ing.id || nextId.current++,
        })) || []
      );
    }
  }, [recipe]);

  useEffect(() => {
    nextId.current = Math.max(...ingredients.map((ing) => ing.id), 0) + 1;
  }, [ingredients]);

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
    setIngredients((prevIngredients) =>
      prevIngredients.filter((ingredient) => ingredient.id !== id)
    );
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File selected:", file);
      setImageFile(file);
      setFileInputKey(Date.now());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!environment) {
      console.error("Contentful environment is not initialized");
      return;
      setSubmitting(true);
    }

    try {
      const latestEntry = await environment.getEntry(recipe.sys.id);

      latestEntry.fields.title["en-US"] = title;
      latestEntry.fields.description["en-US"] = description;
      latestEntry.fields.ingredients["en-US"] = ingredients;

      let imageAsset;
      if (imageFile) {
        const assets = await environment.getAssets({
          "fields.file.fileName": imageFile.name,
          limit: 1,
        });

        if (assets.items.length > 0) {
          imageAsset = assets.items[0];
        } else {
          imageAsset = await environment.createAssetFromFiles({
            fields: {
              title: { "en-US": `Image for ${title}` },
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
          await imageAsset.publish();
          console.log("New asset created and published:", imageAsset);
        }

        latestEntry.fields.image = {
          "en-US": {
            sys: { type: "Link", linkType: "Asset", id: imageAsset.sys.id },
          },
        };
      }

      const updatedEntry = await latestEntry.update();
      await updatedEntry.publish();
      console.log("Updated Entry:", updatedEntry);

      if (onRecipeUpdated) {
        onRecipeUpdated();
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className=" text-white p-4 rounded"
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
        {isEditingTitle ? (
          <input
            type="text"
            className="form-control"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        ) : (
          <span onClick={() => setIsEditingTitle(true)}>
            {originalTitle || title}
          </span>
        )}
      </div>
      <div className="mb-3">
        <label htmlFor="description" className="form-label">
          Description:
        </label>
        {isEditingDescription ? (
          <textarea
            className="form-control"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        ) : (
          <div onClick={() => setIsEditingDescription(true)}>
            {originalDescription || description}
          </div>
        )}
      </div>

      <label htmlFor="ingredients" className="form-label">
        Ingredients:
      </label>

      {ingredients?.map((ingredient) => (
        <div key={ingredient.id} className="mb-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Ingredient Name"
              value={ingredient.name}
              onChange={(e) =>
                handleIngredientChange(ingredient.id, "name", e.target.value)
              }
            />
            <input
              type="text"
              className="form-control"
              placeholder="Quantity"
              value={ingredient.quantity}
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
          key={fileInputKey}
          type="file"
          className="form-control"
          id="image"
          onChange={handleFileChange}
        />
      </div>
      <div style={{ display: "flex", gap: "4px" }}>
        <button
          type="submit"
          style={{
            backgroundColor: "#43766C",
            padding: "5px 10px",
            fontSize: "0.8rem",
          }}
        >
          Update Recipe
        </button>
        <button
          type="button"
          onClick={handleCancel}
          style={{
            backgroundColor: "#D9534F",
            padding: "5px 10px",
            fontSize: "0.8rem",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditRecipes;
