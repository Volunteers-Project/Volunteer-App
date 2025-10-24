import os

def list_structure(start_path='.', indent=0, ignore=None):
    if ignore is None:
        ignore = {'node_modules', '.git', '.next', '__pycache__'}

    for item in sorted(os.listdir(start_path)):
        full_path = os.path.join(start_path, item)
        if item in ignore:
            continue
        print('│   ' * indent + '├── ' + item)
        if os.path.isdir(full_path):
            list_structure(full_path, indent + 1, ignore)

if __name__ == "__main__":
    print("Project structure:\n")
    list_structure('.')
