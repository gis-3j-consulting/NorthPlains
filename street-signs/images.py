import pandas as pd
import os
from arcgis.gis import GIS
from arcgis.features import FeatureLayer
import getpass

image_directory = r"C:\3japps\202501__"

username = input("Enter your ArcGIS Online username: ")
password = getpass.getpass("Enter your ArcGIS Online password: ")
gis = GIS("https://3j.maps.arcgis.com", username, password)

street_signs_id = "96fb3caf57744a5fb98538cbd2644007"
item = gis.content.get(street_signs_id)
layer = item.layers[0]
query_result = layer.query(where="1=1", as_df=True)
images_subset = query_result[["OBJECTID", "images"]]
images_subset["image_array"] = images_subset["images"].str.split(",")


def split_images(image_array):
    return (image_array + [None] * 3)[:3]


images_subset[["image1", "image2", "image3"]] = pd.DataFrame(
    images_subset["image_array"].apply(split_images).tolist(), index=images_subset.index
)

images_subset.head()

images_subset.to_csv(r"C:\3japps\streetsigns.csv")


def change_jpg_to_jpeg(folder_path):
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(".jpg"):
            old_file = os.path.join(folder_path, filename)
            new_file = os.path.join(folder_path, filename[:-4] + ".jpeg")

            os.rename(old_file, new_file)
            print(f"Renamed: {old_file} -> {new_file}")


change_jpg_to_jpeg(image_directory)


def rename_images(df, directory):
    for index, row in df.iterrows():
        file_name = row["OBJECTID"]

        for col in ["image1", "image2", "image3"]:
            image_value = row[col]

            if pd.notna(image_value):
                old_file = f"{image_value}"
                old_path = os.path.join(directory, old_file)

                if os.path.exists(old_path):
                    new_file = f"{file_name}-{col[-1]}.jpg"
                    new_path = os.path.join(directory, new_file)

                    os.rename(old_path, new_path)
                    print(f"Renamed {old_file} to {new_file}")
                else:
                    print(f"File {old_file} not found in {directory}")


rename_images(images_subset, image_directory)


counter = 405

for index, row in df.iterrows():
    for col in image_col:
        if (
            isinstance(row[col], str)
            and row[col].startswith("IMG")
            and row["fileName"] > 155
        ):
            image_name = row[col].replace(".jpeg", ".JPG")
            new_name = f"{row['fileName']}-{col[-1]}.JPG"

            old_path = os.path.join(folder_path, image_name)
            new_path = os.path.join(folder_path, new_name)

            if os.path.exists(old_path):
                os.rename(old_path, new_path)
                print(
                    f"{os.path.basename(old_path)} changed to {os.path.basename(new_path)}"
                )
            else:
                print(f"Error finding {os.path.basename(old_path)}")

        else:
            print(f"Skipping feature {row[col]}")


# Alternate download method for when arcgis library has infinite recursion issues

import requests
import os
import getpass

# ArcGIS Online credentials
username = input("Enter your ArcGIS Online username: ")
password = getpass.getpass("Enter your ArcGIS Online password: ")

layer_url = "https://services3.arcgis.com/pZZTDhBBLO3B9dnl/arcgis/rest/services/survey123_64d4f78251234606b2b8bfd0e29ffde6_results/FeatureServer/0"

output_dir = r"C:\python\scripts\pdfeditor2\processing\downloads\attachments"

# Generate token
token_url = "https://www.arcgis.com/sharing/rest/generateToken"
token_params = {
    "username": username,
    "password": password,
    "referer": "https://3j.maps.arcgis.com",
    "f": "json",
}

token_response = requests.post(token_url, data=token_params)
token = token_response.json()["token"]

# Query features
query_url = f"{layer_url}/query"
query_params = {
    "where": "1=1",
    "outFields": "*",
    "returnGeometry": "false",
    "f": "json",
    "token": token,
}

query_response = requests.get(query_url, params=query_params)
features = query_response.json()["features"]

# Download attachments
for feature in features:
    object_id = feature["attributes"]["objectid"]

    attachments_url = f"{layer_url}/{object_id}/attachments"
    attachments_params = {"f": "json", "token": token}
    attachments_response = requests.get(attachments_url, params=attachments_params)
    attachments = attachments_response.json()["attachmentInfos"]

    if object_id > 124:
        for attachment in attachments:
            attachment_id = attachment["id"]

            attachment_url = f"{layer_url}/{object_id}/attachments/{attachment_id}"
            attachment_params = {"token": token}

            response = requests.get(attachment_url, params=attachment_params)

            if response.status_code == 200:
                # Save the attachment using its ID as the filename
                file_path = os.path.join(output_dir, f"{attachment_id}.xlsx")
                with open(file_path, "wb") as file:
                    file.write(response.content)
                print(f"Downloaded attachment {attachment_id} for feature {object_id}")
            else:
                print(
                    f"Failed to download attachment {attachment_id} for feature {object_id}"
                )
    else:
        print(f"skipping feature {object_id}")

print("Attachment download complete.")

# Add file extension, delete tables as those are processed separately (can sort by file size, tables are ~20kb)
file_path = r"C:\python\scripts\pdfeditor2\attachments"

for file in os.listdir(file_path):
    old_path = os.path.join(file_path, file)

    if os.path.isfile(old_path):
        new_file = file + ".jpg"
        new_path = os.path.join(file_path, new_file)

        os.rename(old_path, new_path)
        print(f"{file} renamed to {new_file}")

print("Renaming complete")
