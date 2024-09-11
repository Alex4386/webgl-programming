#!/bin/bash
cwd=$(pwd)

# Get argument as first parameter
arg1=$1

[[ -z $arg1 ]] && { echo "Usage: $0 <file.html>"; exit 1; }

# check argument is proper file
[[ -f $arg1 ]] || { echo "File not found"; exit 1; }

# go to directory where file is located
cd $(dirname $arg1)

# get the files with .frag and .vert extension
frag=$(ls *.frag)
vert=$(ls *.vert)

# read the file content of arg1
arg1_filename=$(basename $arg1)
content=$(cat $arg1_filename)

replacer=""

# for each frag file entry
for f in $frag; do
    # read the content of frag file
    frag_content=$(cat $f)
    # replace the content of arg1 with frag content
    replacer="$replacer
<!-- [PACKER BEGIN] FILE: $f -->
<script type=\"x-shader/x-fragment\" data-filename=\"$f\">
$frag_content
</script>
"
done

# for each vert file entry
for v in $vert; do
    # read the content of vert file
    vert_content=$(cat $v)
    # replace the content of arg1 with vert content
    replacer="$replacer
<!-- [PACKER BEGIN] FILE: $v -->
<script type=\"x-shader/x-vertex\" data-filename=\"$v\">
$vert_content
</script>

"
done

# Use printf to avoid issues with newlines and special characters
temp_file=$(mktemp)
while IFS= read -r line; do
    stripped_line="$line"
    if [[ "$stripped_line" == *"<!-- [WEBGL]"* ]]; then
        stripped_line=$(echo "$stripped_line" | xargs)
    fi

    if [[ "$stripped_line" == "<!-- [WEBGL] EMBED FILES HERE -->" ]]; then
        # Insert the replacer content here
        printf "%s\n" "$replacer" >> "$temp_file"
    else
        # Write the original content
        printf "%s\n" "$line" >> "$temp_file"
    fi
done < "$arg1_filename"

new_filename="${arg1_filename%.*}.packed.html"

# Move the temp file to test.html
mv "$temp_file" "$new_filename"
cd "$cwd"

cp "$cwd/_common/shaderLoader.js" "$(dirname $arg1)/shaderLoader.js"
