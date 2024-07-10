---
title: How to Extend Disk Space on an EC2 Instance
category: aws
tag: [aws, ec2, disk, tutorial]
---

If you've increased the size of your EC2 instance's disk but don't see the additional space, follow these simple steps to extend the partition and resize the filesystem on an Ubuntu instance.

### Step 1: Log in to Your EC2 Instance
Use SSH to connect to your EC2 instance:
```bash
ssh -i your-key-file.pem ec2-user@your-ec2-instance-public-dns
```

or ssh normally if you have already added the key. 


### Step 2: Check Current Disk Space
```bash
df -h
```

### Step 3: List Partitions
```bash
lsblk
```

### Step 4: Extend the Partition
Install `growpart` if not already installed:
```bash
sudo apt-get update
sudo apt-get install cloud-guest-utils
```

Run `growpart` to extend the partition:
```bash
sudo growpart /dev/xvda 1
```

### Step 5: Resize the Filesystem
- For `ext4` filesystem:
  ```bash
  sudo resize2fs /dev/xvda1
  ```
- For `xfs` filesystem:
  ```bash
  sudo xfs_growfs /
  ```

### Step 6: Verify the Changes
Check the new disk space:
```bash
df -h
```

### Example Commands
```bash
# Step 1: Log in
ssh -i your-key-file.pem ec2-user@your-ec2-instance-public-dns

# Step 2: Check current disk space
df -h

# Step 3: List partitions
lsblk

# Step 4: Extend the partition
sudo apt-get update
sudo apt-get install cloud-guest-utils
sudo growpart /dev/xvda 1

# Step 5: Resize the filesystem (choose the appropriate command)
sudo resize2fs /dev/xvda1  # For ext4
# or
sudo xfs_growfs /          # For xfs

# Step 6: Verify the changes
df -h
```

By following these steps, you can effectively extend the disk space on your EC2 instance.