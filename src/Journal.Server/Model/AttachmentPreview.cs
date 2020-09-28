using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Journal.Server.Model
{
    /// <summary>
    /// Represents a preview of an <see cref="Attachment"/> including only metadata about the attachments and not the real content.
    /// </summary>
    public class AttachmentPreview
    {
        public  AttachmentPreview()
        {
        }

        public AttachmentPreview(string id, string filename)
        {
            this.Id = id;
            this.FileName = filename;
        }

        public string Id { get; set; }

        /// <summary>
        /// Gets or sets the attachments original filename.
        /// </summary>
        public string FileName { get; set; }
    }
}
