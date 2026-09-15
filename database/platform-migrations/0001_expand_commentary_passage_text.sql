-- Classical Sanskrit commentaries can exceed MySQL TEXT's 65,535-byte limit.
ALTER TABLE `commentary_passages`
  MODIFY COLUMN `text` MEDIUMTEXT NOT NULL;
