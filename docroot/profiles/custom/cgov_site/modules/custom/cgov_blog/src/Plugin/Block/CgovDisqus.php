<?php

namespace Drupal\cgov_blog\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a Blog Categories Block.
 *
 * @Block(
 *   id = "cgov_disqus",
 *   admin_label = @Translation("Cgov Disqus Block"),
 *   category = @Translation("Cgov Digital Platform"),
 * )
 */
class CgovDisqus extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [
      '#markup' => $this->t('
        <div id="disqus_thread"></div>
        <script>
            /**
             *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT 
             *  THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR 
             *  PLATFORM OR CMS.
             *  
             *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: 
             *  https://disqus.com/admin/universalcode/#configuration-variables
             */
            /*

            // TODO: Generate programatically.
            var disqus_identifier = "rx:cgvBlogPost-1140158";
            var disqus_url = "https://www.cancer.gov/news-events/cancer-currents-blog/foo";

            var disqus_config = function () {
                // Replace PAGE_URL with your page′s canonical URL variable
                this.page.url = disqus_url;
                
                // Replace PAGE_IDENTIFIER with your page′s unique identifier variable
                this.page.identifier = disqus_identifier; 
            };
            */
            
            (function() {  // REQUIRED CONFIGURATION VARIABLE: EDIT THE SHORTNAME BELOW
                var d = document, s = d.createElement("script");
                var disqus_shortname = "cancer-currents-dev";
                // IMPORTANT: Replace EXAMPLE with your forum shortname!
                s.src = "https://" + disqus_shortname + ".disqus.com/embed.js";                
                s.setAttribute("data-timestamp", +new Date());
                (d.head || d.body).appendChild(s);
            })();
        </script>
        <noscript>
            Please enable JavaScript to view the 
            <a href="https://disqus.com/?ref_noscript" rel="nofollow">
                comments powered by Disqus.
            </a>
        </noscript>
      '),
    ];
    return $build;
  }

}
